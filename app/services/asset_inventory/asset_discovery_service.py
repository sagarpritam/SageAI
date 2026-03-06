"""
SageAI 2.0 — Asset Discovery Service
Core orchestrator for Attack Surface Management.

Pipeline:
  1. crt.sh → enumerate subdomains from certificate transparency logs
  2. DNS → resolve each subdomain to IP
  3. Shodan → enriched service/port/vuln data per IP
  4. Port Scanner → verify open ports
  5. HTTP probe → fetch title, status, headers for tech fingerprinting
  6. Risk Engine → score each discovered asset
  7. Persist to Asset DB (upsert — update if seen before, create if new)
  8. Return summary + new/changed asset list for alerting
"""

import json
import logging
import socket
import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Tuple

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset, AssetType, AssetStatus
from app.services import crtsh_client, shodan_client, dns_scanner, port_scanner

logger = logging.getLogger("sageai.asset_discovery")

# Ports that indicate specific high-risk services
HIGH_RISK_PORTS = {
    22: "SSH", 23: "Telnet", 3389: "RDP", 5900: "VNC",
    8080: "HTTP-Alt (often dev/admin)", 8443: "HTTPS-Alt",
    9200: "Elasticsearch", 27017: "MongoDB", 6379: "Redis",
    5432: "PostgreSQL", 3306: "MySQL", 2375: "Docker API",
    4848: "GlassFish Admin", 8500: "Consul", 9090: "Prometheus",
}

SENSITIVE_KEYWORDS = [
    "admin", "staging", "dev", "test", "internal", "vpn",
    "api-dev", "debug", "qa", "uat", "beta", "demo", "legacy",
    "old", "backup", "jenkins", "jira", "gitlab", "confluence",
]


async def _probe_http(subdomain: str) -> Tuple[int | None, str | None, List[str]]:
    """HTTP HEAD/GET probe — returns (status, title, technologies)."""
    techs = []
    for scheme in ["https", "http"]:
        url = f"{scheme}://{subdomain}"
        try:
            async with httpx.AsyncClient(timeout=8, follow_redirects=True, verify=False) as client:
                resp = await client.get(url)
                status = resp.status_code

                # Technology fingerprinting via headers
                server = resp.headers.get("server", "")
                powered_by = resp.headers.get("x-powered-by", "")
                if server:
                    techs.append(server)
                if powered_by:
                    techs.append(powered_by)

                # Extract page title
                title = None
                if b"<title" in resp.content[:4096]:
                    raw = resp.text[:4096]
                    start = raw.lower().find("<title>")
                    end = raw.lower().find("</title>")
                    if start != -1 and end != -1:
                        title = raw[start + 7:end].strip()[:120]

                return status, title, list(set(techs))
        except Exception:
            continue
    return None, None, techs


def _compute_risk(asset: dict) -> Tuple[float, str]:
    """Simple risk scoring for a discovered asset."""
    score = 0.0

    # High-risk ports found
    risky_ports = [p for p in asset.get("open_ports", []) if p in HIGH_RISK_PORTS]
    score += len(risky_ports) * 15

    # Sensitive subdomain keyword
    value = asset.get("value", "").lower()
    if any(kw in value for kw in SENSITIVE_KEYWORDS):
        score += 25

    # HTTP exposed
    if asset.get("http_status") and asset["http_status"] < 400:
        score += 10

    score = min(score, 100)

    if score >= 70:
        level = "Critical"
    elif score >= 45:
        level = "High"
    elif score >= 20:
        level = "Medium"
    else:
        level = "Low"

    return round(score, 1), level


async def discover_assets(
    org_id: str,
    target: str,
    db: AsyncSession,
    scan_id: str | None = None,
) -> dict:
    """
    Full asset discovery pipeline for a root domain.
    Returns a summary dict with counts + lists of new/changed/high-risk assets.
    """
    target = target.replace("https://", "").replace("http://", "").split("/")[0].strip()
    logger.info(f"[ASM] Starting asset discovery for {target} (org={org_id})")

    new_assets = []
    updated_assets = []
    all_subdomains = set()
    all_subdomains.add(target)  # Always include root domain

    # ── Step 1: crt.sh subdomain enumeration ─────────────────────────────
    try:
        crt_findings = await crtsh_client.search_certificates(target)
        for f in crt_findings:
            for sub in f.get("subdomains", []):
                sub = sub.strip().lstrip("*.")
                if sub.endswith(f".{target}") or sub == target:
                    all_subdomains.add(sub)
    except Exception as e:
        logger.warning(f"[ASM] crt.sh error: {e}")

    # ── Step 2: DNS scanner for additional subdomains ─────────────────────
    try:
        dns_findings = await dns_scanner.scan_dns(target)
        for f in dns_findings:
            for sub in f.get("subdomains", []):
                all_subdomains.add(sub)
    except Exception as e:
        logger.warning(f"[ASM] DNS error: {e}")

    logger.info(f"[ASM] Discovered {len(all_subdomains)} subdomains for {target}")

    # ── Step 3: Enrich each subdomain ────────────────────────────────────
    # Process subdomains concurrently (max 10 at a time to be polite)
    semaphore = asyncio.Semaphore(10)

    async def enrich_subdomain(sub: str):
        async with semaphore:
            asset_data = {
                "value": sub,
                "asset_type": AssetType.domain if sub == target else AssetType.subdomain,
                "org_id": org_id,
            }

            # Resolve IP
            try:
                ip = socket.gethostbyname(sub)
                asset_data["ip_address"] = ip
            except Exception:
                ip = None

            # HTTP probe
            status, title, techs = await _probe_http(sub)
            asset_data["http_status"] = status
            asset_data["http_title"] = title
            asset_data["technologies"] = techs

            # Shodan enrichment (if IP resolved)
            open_ports = []
            shodan_data = {}
            if ip:
                try:
                    shodan_findings = await shodan_client.lookup_ip(sub)
                    for f in shodan_findings:
                        if f.get("type") == "shodan_ports":
                            open_ports = f.get("ports", [])
                        if not techs:
                            for f2 in shodan_findings:
                                if f2.get("type") == "shodan_cpes":
                                    for cpe in f2.get("cpes", []):
                                        parts = cpe.split(":")
                                        if len(parts) >= 5:
                                            techs.append(f"{parts[3]}/{parts[4]}")
                    shodan_data = {f.get("type"): f for f in shodan_findings}
                except Exception:
                    pass

            asset_data["open_ports"] = open_ports
            asset_data["shodan_data"] = json.dumps(shodan_data)

            # Risk score
            risk_score, risk_level = _compute_risk(asset_data)
            asset_data["risk_score"] = risk_score
            asset_data["risk_level"] = risk_level

            return asset_data

    tasks = [enrich_subdomain(sub) for sub in list(all_subdomains)[:50]]  # cap at 50
    enriched = await asyncio.gather(*tasks, return_exceptions=True)

    # ── Step 4: Persist to DB (upsert) ────────────────────────────────────
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(hours=24)

    for item in enriched:
        if isinstance(item, Exception):
            continue

        # Check existing
        result = await db.execute(
            select(Asset).where(
                and_(Asset.org_id == org_id, Asset.value == item["value"])
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing asset
            prev_ports = json.loads(existing.open_ports or "[]")
            curr_ports = item.get("open_ports", [])
            changed = set(curr_ports) != set(prev_ports) or existing.risk_level != item["risk_level"]

            existing.ip_address = item.get("ip_address")
            existing.open_ports = json.dumps(curr_ports)
            existing.technologies = json.dumps(item.get("technologies", []))
            existing.http_status = item.get("http_status")
            existing.http_title = item.get("http_title")
            existing.risk_score = item["risk_score"]
            existing.risk_level = item["risk_level"]
            existing.shodan_data = item.get("shodan_data", "{}")
            existing.last_seen = now
            existing.last_scanned = now
            existing.status = AssetStatus.active
            existing.discovered_in_scan = scan_id

            if changed:
                updated_assets.append(existing.value)
        else:
            # Create new asset
            new_asset = Asset(
                org_id=org_id,
                asset_type=item["asset_type"],
                value=item["value"],
                ip_address=item.get("ip_address"),
                open_ports=json.dumps(item.get("open_ports", [])),
                technologies=json.dumps(item.get("technologies", [])),
                http_status=item.get("http_status"),
                http_title=item.get("http_title"),
                risk_score=item["risk_score"],
                risk_level=item["risk_level"],
                shodan_data=item.get("shodan_data", "{}"),
                first_seen=now,
                last_seen=now,
                last_scanned=now,
                status=AssetStatus.active,
                discovered_in_scan=scan_id,
            )
            db.add(new_asset)
            new_assets.append(item["value"])

    await db.commit()

    # ── Step 5: Mark stale assets ─────────────────────────────────────────
    stale_result = await db.execute(
        select(Asset).where(
            and_(
                Asset.org_id == org_id,
                Asset.last_seen < (now - timedelta(days=30)),
                Asset.status == AssetStatus.active,
            )
        )
    )
    stale_assets = stale_result.scalars().all()
    for a in stale_assets:
        a.status = AssetStatus.stale
    await db.commit()

    # ── Step 6: Build summary ─────────────────────────────────────────────
    all_result = await db.execute(
        select(Asset).where(Asset.org_id == org_id)
    )
    all_assets = all_result.scalars().all()

    summary = {
        "total": len(all_assets),
        "domains": sum(1 for a in all_assets if a.asset_type == AssetType.domain),
        "subdomains": sum(1 for a in all_assets if a.asset_type == AssetType.subdomain),
        "ips": sum(1 for a in all_assets if a.asset_type == AssetType.ip),
        "servers": sum(1 for a in all_assets if a.asset_type == AssetType.server),
        "apis": sum(1 for a in all_assets if a.asset_type == AssetType.api),
        "high_risk": sum(1 for a in all_assets if a.risk_level in ("High", "Critical")),
        "critical": sum(1 for a in all_assets if a.risk_level == "Critical"),
        "active": sum(1 for a in all_assets if a.status == AssetStatus.active),
        "stale": sum(1 for a in all_assets if a.status == AssetStatus.stale),
        "new_last_24h": len(new_assets),
        "new_assets": new_assets[:20],
        "updated_assets": updated_assets[:20],
        "target": target,
        "scanned_at": now.isoformat(),
    }

    logger.info(f"[ASM] Discovery complete for {target}: {summary['total']} total assets, {len(new_assets)} new")
    return summary
