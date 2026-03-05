"""Webhook management and delivery."""

import hashlib
import hmac
import json
import logging
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.core.database import get_db
from app.core.security import require_role
from app.models.webhook import Webhook

logger = logging.getLogger("SageAI.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("")
async def create_webhook(
    url: str,
    event: str = "scan.completed",
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Register a webhook endpoint (admin only)."""
    if event not in ("scan.completed", "scan.failed"):
        raise HTTPException(status_code=400, detail="Event must be 'scan.completed' or 'scan.failed'")

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
        {"id": h.id, "url": h.url, "event": h.event, "is_active": h.is_active, "created_at": h.created_at}
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
        select(Webhook).where(Webhook.id == webhook_id, Webhook.organization_id == current_user["org"])
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
            Webhook.is_active == True,
        )
    )
    webhooks = result.scalars().all()

    body = json.dumps(payload)

    async with httpx.AsyncClient(timeout=10) as client:
        for hook in webhooks:
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
