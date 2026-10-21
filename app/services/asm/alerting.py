"""
SageAI 4.0 — ASM Alerting Service
Checks for unsent ASM events and dispatches them to configured webhooks (e.g. Slack).
"""

import hashlib
import hmac
import json
import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.asm_event import ASMEvent
from app.models.webhook import Webhook

logger = logging.getLogger("sageai.asm.alerting")


async def _dispatch_events_with_session(db: AsyncSession) -> int:
    """Core logic to dispatch unsent ASM events using an active database session."""
    # Fetch unsent events
    stmt = select(ASMEvent).where(ASMEvent.is_alert_sent.is_(False))
    result = await db.execute(stmt)
    events = result.scalars().all()

    if not events:
        return 0

    logger.info(f"[ASM Alerting] Found {len(events)} unsent events. Processing...")

    for evt in events:
        # Look for active webhooks connected to this org
        hooks_res = await db.execute(
            select(Webhook).where(
                Webhook.organization_id == evt.organization_id,
                Webhook.is_active.is_(True),
            )
        )
        webhooks = hooks_res.scalars().all()

        # Parse event details safely
        details_obj = {}
        if evt.details:
            try:
                details_obj = json.loads(evt.details)
            except Exception:
                details_obj = {"raw": evt.details}

        severity_str = (
            evt.severity.value if hasattr(evt.severity, "value") else str(evt.severity)
        )
        event_type_str = (
            evt.event_type.value
            if hasattr(evt.event_type, "value")
            else str(evt.event_type)
        )

        # Build dual-format payload (JSON API + Slack compatible)
        payload = {
            "event": "asm.alert",
            "event_type": event_type_str,
            "severity": severity_str,
            "title": evt.title,
            "description": evt.description,
            "asset_id": evt.asset_id,
            "scan_id": evt.scan_id,
            "details": details_obj,
            "created_at": evt.created_at.isoformat() if evt.created_at else None,
            "text": f"*{severity_str.upper()} Alert:* {evt.title}\n{evt.description or ''}",
            "attachments": [
                {
                    "color": (
                        "#ef4444"
                        if severity_str in ("critical", "high")
                        else "#f59e0b"
                        if severity_str == "medium"
                        else "#3b82f6"
                    ),
                    "fields": [
                        {"title": "Event Type", "value": event_type_str, "short": True},
                        {
                            "title": "Severity",
                            "value": severity_str.upper(),
                            "short": True,
                        },
                        *(
                            [
                                {
                                    "title": "Asset ID",
                                    "value": evt.asset_id,
                                    "short": True,
                                }
                            ]
                            if evt.asset_id
                            else []
                        ),
                    ],
                }
            ],
        }

        body = json.dumps(payload)

        for hook in webhooks:
            # Filter by event subscription if configured
            if hook.event and hook.event not in (
                "asm.alert",
                "*",
                "all",
                "scan.completed",
            ):
                continue

            headers = {
                "Content-Type": "application/json",
                "User-Agent": "SageAI-ASM-Alerts/1.0",
                "X-SageAI-Event": "asm.alert",
            }

            if hook.secret:
                signature = hmac.new(
                    hook.secret.encode("utf-8"),
                    body.encode("utf-8"),
                    hashlib.sha256,
                ).hexdigest()
                headers["X-SageAI-Signature"] = f"sha256={signature}"

            try:
                async with httpx.AsyncClient(timeout=8) as client:
                    resp = await client.post(
                        str(hook.url), content=body, headers=headers
                    )
                    if resp.is_error:
                        logger.warning(
                            f"[ASM Alerting] Webhook {hook.url} returned status {resp.status_code} for ASM Event {evt.id}"
                        )
                    else:
                        logger.info(
                            f"[ASM Alerting] Dispatched event {evt.id} to {hook.url}"
                        )
            except Exception as e:
                logger.warning(
                    f"[ASM Alerting] Failed to trigger webhook {hook.url} for ASM Event {evt.id}: {e}"
                )

        # Mark sent regardless of webhooks existence so we don't loop
        evt.is_alert_sent = True

    await db.commit()
    return len(events)


async def dispatch_unnotified_events(db: AsyncSession | None = None) -> int:
    """Find ASM events that haven't triggered alerts and dispatch them.
    Accepts an optional active db session or opens one from AsyncSessionLocal.
    Returns the count of events processed.
    """
    if db is not None:
        return await _dispatch_events_with_session(db)

    async with AsyncSessionLocal() as session:
        return await _dispatch_events_with_session(session)
