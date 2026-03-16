"""
SageAI 4.0 — ASM Alerting Service
Checks for unsent ASM events and dispatches them to configured webhooks (e.g. Slack).
"""
import logging
import httpx
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.asm_event import ASMEvent
from app.models.webhook import Webhook

logger = logging.getLogger("sageai.asm.alerting")

async def dispatch_unnotified_events():
    """Find ASM events that haven't triggered alerts and send them."""
    async with SessionLocal() as db:
        # Fetch unsent events
        stmt = select(ASMEvent).where(ASMEvent.is_alert_sent == "false")
        result = await db.execute(stmt)
        events = result.scalars().all()
        
        if not events:
            return
            
        logger.info(f"[ASM Alerting] Found {len(events)} unsent events. Processing...")
        
        for evt in events:
            # Look for webhooks connected to this org
            hooks_res = await db.execute(select(Webhook).where(Webhook.organization_id == evt.org_id))
            webhooks = hooks_res.scalars().all()
            
            for hook in webhooks:
                # Dispatch a POST request to external Slack or webhooks
                payload = {
                    "text": f"*{evt.severity.upper()} Alert:* {evt.title}\n{evt.description}",
                    "details": evt.details
                }
                try:
                    async with httpx.AsyncClient(timeout=5) as client:
                        await client.post(hook.url, json=payload)
                except Exception as e:
                    logger.warning(f"Failed to trigger webhook {hook.url} for ASM Event {evt.id}: {e}")

            # Mark sent regardless of webhooks existence so we don't loop
            evt.is_alert_sent = "true"
            
        await db.commit()
