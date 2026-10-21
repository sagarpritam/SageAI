import hashlib
import hmac
import ipaddress
import json
import logging
import secrets
import socket
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.models.webhook import Webhook

logger = logging.getLogger("SageAI.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def is_safe_webhook_url(url: str) -> tuple[bool, str]:
    """Validate that a webhook target URL is safe and not an internal/private endpoint.

    Protects against SSRF attacking internal services, localhost, or cloud metadata endpoints.
    """
    if not url or not isinstance(url, str):
        return False, "URL is required"

    try:
        parsed = urlparse(url.strip())
    except Exception:
        return False, "Invalid URL format"

    if parsed.scheme not in ("http", "https"):
        return False, "Webhook URL must use http or https scheme"

    hostname = parsed.hostname
    if not hostname:
        return False, "Webhook URL must include a valid hostname"

    # Blocked hostnames (cloud metadata, loopbacks, internal names)
    blocked_hosts = {
        "metadata.google.internal",
        "metadata",
        "instance-data",
        "localhost",
    }
    lowered = hostname.lower()
    if (
        lowered in blocked_hosts
        or lowered.endswith(".internal")
        or lowered.endswith(".local")
    ):
        return False, f"Target host '{hostname}' is not permitted"

    # Check IP literal directly
    try:
        ip = ipaddress.ip_address(hostname)
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
        ):
            return (
                False,
                f"Target IP {hostname} is a restricted/private network address",
            )
    except ValueError:
        pass

    # Resolve hostname to check against private/reserved ranges
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_str = item[4][0]
            try:
                ip = ipaddress.ip_address(ip_str)
                if (
                    ip.is_private
                    or ip.is_loopback
                    or ip.is_link_local
                    or ip.is_reserved
                    or ip.is_multicast
                ):
                    return (
                        False,
                        f"Target resolves to a restricted/private network ({ip_str})",
                    )
            except ValueError:
                continue
    except socket.gaierror:
        # If hostname cannot be resolved at registration, allow if not explicitly blocked
        pass

    return True, ""


@router.post("")
async def create_webhook(
    url: str,
    event: str = "scan.completed",
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Register a webhook endpoint (admin only)."""
    if event not in ("scan.completed", "scan.failed"):
        raise HTTPException(
            status_code=400, detail="Event must be 'scan.completed' or 'scan.failed'"
        )

    is_safe, error_msg = is_safe_webhook_url(url)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Invalid webhook URL: {error_msg}")

    secret = secrets.token_hex(32)
    webhook = Webhook(
        url=url,
        event=event,
        organization_id=current_user["org"],
        secret=secret,
    )
    db.add(webhook)
    await db.commit()

    return {
        "id": webhook.id,
        "url": url,
        "event": event,
        "secret": secret,
        "message": "Save the secret for HMAC verification.",
    }


@router.get("")
async def list_webhooks(
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all webhooks for the organization."""
    result = await db.execute(
        select(Webhook).where(Webhook.organization_id == current_user["org"])
    )
    hooks = result.scalars().all()

    return [
        {
            "id": h.id,
            "url": h.url,
            "event": h.event,
            "is_active": h.is_active,
            "created_at": h.created_at,
        }
        for h in hooks
    ]


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Delete a webhook."""
    result = await db.execute(
        select(Webhook).where(
            Webhook.id == webhook_id, Webhook.organization_id == current_user["org"]
        )
    )
    hook = result.scalar_one_or_none()
    if not hook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    await db.delete(hook)
    await db.commit()
    return {"message": "Webhook deleted"}


async def fire_webhook(event: str, org_id: str, payload: dict, db: AsyncSession):
    """Fire all active webhooks for an event in an organization."""
    result = await db.execute(
        select(Webhook).where(
            Webhook.organization_id == org_id,
            Webhook.event == event,
            Webhook.is_active,
        )
    )
    webhooks = result.scalars().all()

    body = json.dumps(payload)

    async with httpx.AsyncClient(timeout=10) as client:
        for hook in webhooks:
            is_safe, error_msg = is_safe_webhook_url(hook.url)
            if not is_safe:
                logger.warning(
                    "Skipping webhook delivery to unsafe URL %s: %s",
                    hook.url,
                    error_msg,
                )
                continue

            # HMAC signature for verification
            signature = hmac.new(
                hook.secret.encode(), body.encode(), hashlib.sha256
            ).hexdigest()

            try:
                await client.post(
                    hook.url,
                    content=body,
                    headers={
                        "Content-Type": "application/json",
                        "X-SageAI-Signature": f"sha256={signature}",
                        "X-SageAI-Event": event,
                    },
                )
                logger.info(f"Webhook delivered: {event} → {hook.url}")
            except Exception as e:
                logger.error(f"Webhook failed: {event} → {hook.url}: {e}")
