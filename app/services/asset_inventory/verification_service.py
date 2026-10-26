"""Asset Ownership Verification Service.

Verifies that an organization owns or is authorized to scan a target domain/subdomain.
Supports two enterprise verification methods:
  1. DNS TXT record challenge: Host a TXT record on '_sageai-challenge.<domain>' or '<domain>'
  2. HTTP file challenge: Host '<token>' at 'https://<domain>/.well-known/sageai-challenge.txt'
"""

import asyncio
import ipaddress
import logging
import uuid
from typing import Optional, Tuple

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset
from app.routers.webhook_routes import is_safe_webhook_url
from app.utils.helpers import utc_now

logger = logging.getLogger("SageAI.verification")


def generate_challenge_token() -> str:
    """Generate a high-entropy, unique verification challenge token."""
    return f"sageai-verify-{uuid.uuid4().hex[:24]}"


def get_challenge_instructions(asset: Asset) -> dict:
    """Return DNS and HTTP challenge instructions for the asset."""
    token = asset.verification_token
    if not token:
        token = generate_challenge_token()
        asset.verification_token = token

    domain = asset.value.strip().lower()
    for prefix in ("https://", "http://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix) :]
    domain = domain.split("/")[0].split(":")[0]

    return {
        "asset_id": asset.id,
        "domain": domain,
        "token": token,
        "is_verified": bool(asset.is_verified),
        "verified_at": asset.verified_at.isoformat() if asset.verified_at else None,
        "verification_method": asset.verification_method,
        "dns_challenge": {
            "record_type": "TXT",
            "host": f"_sageai-challenge.{domain}",
            "fallback_host": domain,
            "expected_value": token,
        },
        "http_challenge": {
            "url": f"https://{domain}/.well-known/sageai-challenge.txt",
            "expected_content": token,
        },
    }


def _lookup_dns_txt(domain: str, token: str) -> Tuple[bool, str]:
    """Synchronous DNS lookup using dnspython (executed in a worker thread)."""
    try:
        import dns.resolver

        resolver = dns.resolver.Resolver()
        resolver.timeout = 4.0
        resolver.lifetime = 4.0

        targets_to_check = [f"_sageai-challenge.{domain}", domain]
        for target_host in targets_to_check:
            try:
                answers = resolver.resolve(target_host, "TXT")
                for rdata in answers:
                    for txt_string in rdata.strings:
                        txt_val = txt_string.decode("utf-8", errors="ignore").strip()
                        if token in txt_val:
                            return True, f"Verified via DNS TXT record on {target_host}"
            except (
                dns.resolver.NXDOMAIN,
                dns.resolver.NoAnswer,
                dns.resolver.NoNameservers,
            ):
                continue
            except Exception as e:
                logger.debug(f"DNS lookup failed for {target_host}: {e}")

        return False, "DNS TXT record not found or token does not match"
    except Exception as exc:
        return False, f"DNS resolution error: {exc}"


async def verify_dns_challenge(domain: str, token: str) -> Tuple[bool, str]:
    """Asynchronously verify DNS TXT challenge without blocking the event loop."""
    return await asyncio.to_thread(_lookup_dns_txt, domain, token)


async def _safe_http_probe(
    initial_url: str, expected_token: str, max_redirects: int = 3
) -> Tuple[bool, str]:
    """Safely fetch challenge URL inspecting each redirect hop for SSRF and private address escape."""
    current_url = initial_url
    async with httpx.AsyncClient(
        timeout=5.0, follow_redirects=False, verify=True
    ) as client:
        for hop in range(max_redirects + 1):
            is_safe, error_msg = is_safe_webhook_url(current_url)
            if not is_safe:
                logger.warning(
                    f"Blocked HTTP challenge hop {hop} to '{current_url}': {error_msg}"
                )
                return (
                    False,
                    f"Redirect target '{current_url}' is not permitted: {error_msg}",
                )

            try:
                res = await client.get(
                    current_url,
                    headers={"User-Agent": "SageAI-Domain-Verifier/2.0"},
                )
                if res.is_redirect and "location" in res.headers:
                    next_loc = res.headers["location"]
                    current_url = str(res.url.join(next_loc))
                    continue

                if res.status_code == 200:
                    body = res.text.strip()
                    if expected_token in body:
                        return True, f"Verified via HTTP file at {initial_url}"
                return False, "HTTP challenge response status != 200 or token mismatch"
            except Exception as e:
                logger.debug(f"HTTP challenge request failed for {current_url}: {e}")
                return False, f"HTTP request failed: {e}"

    return False, "Too many redirects during verification challenge"


async def verify_http_challenge(domain: str, token: str) -> Tuple[bool, str]:
    """Verify HTTP challenge file at https://<domain>/.well-known/sageai-challenge.txt with redirect validation."""
    candidate_urls = [
        f"https://{domain}/.well-known/sageai-challenge.txt",
        f"http://{domain}/.well-known/sageai-challenge.txt",
    ]

    last_error = "HTTP challenge file not found or token does not match"
    for target_url in candidate_urls:
        success, msg = await _safe_http_probe(target_url, token)
        if success:
            return True, msg
        if "not permitted" in msg or "restricted" in msg or "Redirect target" in msg:
            last_error = msg

    return False, last_error


async def verify_asset_ownership(
    db: AsyncSession,
    asset: Asset,
    method: Optional[str] = None,
) -> Tuple[bool, str]:
    """Verify ownership of an asset.

    If method is 'dns', checks DNS TXT record only.
    If method is 'http', checks HTTP file challenge only.
    Otherwise, checks DNS first, then HTTP file challenge fallback.
    """
    if not asset.verification_token:
        asset.verification_token = generate_challenge_token()
        await db.commit()
        await db.refresh(asset)

    domain = asset.value.strip().lower()
    for prefix in ("https://", "http://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix) :]
    domain = domain.split("/")[0].split(":")[0]
    token = asset.verification_token

    # 1. DNS method
    if method in ("dns", "dns_txt", None):
        success, msg = await verify_dns_challenge(domain, token)
        if success:
            asset.is_verified = True
            asset.verification_method = "dns_txt"
            asset.verified_at = utc_now()
            await db.commit()
            await db.refresh(asset)
            return True, msg

    # 2. HTTP method
    if method in ("http", "http_file", None):
        success, msg = await verify_http_challenge(domain, token)
        if success:
            asset.is_verified = True
            asset.verification_method = "http_file"
            asset.verified_at = utc_now()
            await db.commit()
            await db.refresh(asset)
            return True, msg

    return (
        False,
        "Ownership verification failed. Please verify DNS TXT record or HTTP challenge file.",
    )


def extract_target_domain(target: str) -> str:
    """Extract clean domain or IP from a target string or URL."""
    target = target.strip().lower()
    for prefix in ("https://", "http://"):
        if target.startswith(prefix):
            target = target[len(prefix) :]
    target = target.split("/")[0].split(":")[0]
    return target


async def is_target_authorized(
    db: AsyncSession, org_id: str, target_url_or_domain: str
) -> bool:
    """Check if target domain or any of its parent domains are verified by the organization.

    Example: if 'api.staging.example.com' is checked, returns True if 'api.staging.example.com',
    'staging.example.com', or 'example.com' is verified by org_id.
    """
    clean_target = extract_target_domain(target_url_or_domain)
    if not clean_target:
        return False

    # 1. Direct match on asset
    asset_res = await db.execute(
        select(Asset).where(
            Asset.organization_id == org_id,
            Asset.value == clean_target,
            Asset.is_verified == True,  # noqa: E712
        )
    )
    if asset_res.scalar_one_or_none():
        return True

    # 2. Check parent domain hierarchy if target is a hostname (contains dots and not an IP)
    try:
        ipaddress.ip_address(clean_target)
        return False  # IPs do not inherit domain hierarchy
    except ValueError:
        pass

    parts = clean_target.split(".")
    # Must have at least 2 parts for a domain (e.g. example.com)
    for i in range(1, len(parts) - 1):
        parent_domain = ".".join(parts[i:])
        parent_res = await db.execute(
            select(Asset).where(
                Asset.organization_id == org_id,
                Asset.value == parent_domain,
                Asset.is_verified == True,  # noqa: E712
            )
        )
        if parent_res.scalar_one_or_none():
            return True

    return False
