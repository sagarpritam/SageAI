"""Celery task queue configuration for async scan processing.

Usage:
  - Start worker: celery -A app.tasks.celery_app worker --loglevel=info
  - Start beat (scheduled): celery -A app.tasks.celery_app beat --loglevel=info
"""

import asyncio
import logging
import os

from celery import Celery
from celery.schedules import crontab

logger = logging.getLogger(__name__)

# Redis URL from env or default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "SageAI",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per scan
    task_soft_time_limit=240,
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "asm-continuous-recon-12h": {
            "task": "SageAI.asm_scheduled_recon",
            "schedule": crontab(minute=0, hour="*/12"),
        },
        "cisa-kev-daily-sync": {
            "task": "SageAI.sync_threat_feeds",
            "schedule": crontab(minute=30, hour=2),  # Runs daily at 02:30 UTC
        },
        "cleanup-old-scans-weekly": {
            "task": "SageAI.cleanup_old_scans",
            "schedule": crontab(
                minute=0, hour=3, day_of_week="sunday"
            ),  # Weekly on Sunday at 03:00 UTC
        },
    },
)


def _run_async(coro):
    """Safely run an async coroutine from a sync Celery task."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures

        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


@celery_app.task(
    bind=True, name="SageAI.run_scan", max_retries=3, default_retry_delay=10
)
def run_scan_task(self, scan_id: str, target: str, org_id: str, **kwargs):
    """Async scan task — runs security checks in a background worker fleet.

    Updates the Scan DB record with results, progress, and dispatches alerts on completion.
    """
    from app.services.alerting.dispatcher import dispatch_security_alert
    from app.services.audit_service import log_audit_event
    from app.services.risk_engine import calculate_risk
    from app.services.scanner_service import run_all_scans

    async def _execute():
        from sqlalchemy import select

        from app.core.database import AsyncSessionLocal
        from app.models.finding import Finding
        from app.models.scan import Scan

        async with AsyncSessionLocal() as db:
            try:
                self.update_state(
                    state="SCANNING", meta={"target": target, "progress": 25}
                )
                logger.info(
                    "Task %s: scanning %s (kwargs: %s)", scan_id, target, kwargs
                )

                # Set running state
                scan_res = await db.execute(select(Scan).where(Scan.id == scan_id))
                scan = scan_res.scalar_one_or_none()
                if scan:
                    scan.status = "running"
                    scan.stage = "network_scanning"
                    scan.progress = 30
                    await db.commit()

                findings = await run_all_scans(target, scan_id=scan_id)
                risk = calculate_risk(findings)

                # Update scan record
                result = await db.execute(select(Scan).where(Scan.id == scan_id))
                scan = result.scalar_one_or_none()

                if scan:
                    scan.set_findings(findings)
                    scan.risk_score = risk["risk_score"]
                    scan.risk_level = risk["risk_level"]
                    scan.status = "completed"
                    scan.stage = "completed"
                    scan.progress = 100

                    # Persist individual findings
                    for f in findings:
                        finding = Finding(
                            scan_id=scan.id,
                            title=f.get("type", "Unknown Vulnerability"),
                            description=f.get("description", ""),
                            severity=f.get("severity", "Low").capitalize(),
                            cvss_score=f.get("cvss", 0.0),
                            asset_identified=target,
                        )
                        db.add(finding)

                    await db.commit()
                    logger.info(
                        "Task %s: completed with %d findings", scan_id, len(findings)
                    )

                    # Trigger alert dispatch
                    await dispatch_security_alert(
                        db=db,
                        organization_id=org_id,
                        title=f"Scan Completed: {target} ({scan.risk_level} Risk)",
                        target=target,
                        severity=scan.risk_level.lower()
                        if scan.risk_level
                        else "medium",
                        risk_score=float(scan.risk_score or 0.0),
                        details=f"Scan completed with {len(findings)} findings identified.",
                        findings_count=len(findings),
                        metadata={"scan_id": scan.id, "risk_score": scan.risk_score},
                    )

                    await log_audit_event(
                        db=db,
                        organization_id=org_id,
                        action="SCAN_COMPLETED",
                        resource_type="scan",
                        resource_id=scan.id,
                        details={"target": target, "findings_count": len(findings)},
                    )

                return {
                    "scan_id": scan_id,
                    "status": "completed",
                    "findings_count": len(findings),
                    "risk_score": risk["risk_score"],
                    "risk_level": risk["risk_level"],
                }
            except Exception as exc:
                logger.error("Task %s failed: %s", scan_id, exc, exc_info=True)

                # Mark scan as failed in DB
                try:
                    result = await db.execute(select(Scan).where(Scan.id == scan_id))
                    scan = result.scalar_one_or_none()
                    if scan:
                        scan.status = "failed"
                        scan.stage = "error"
                        scan.retry_count += 1
                        await db.commit()

                    await log_audit_event(
                        db=db,
                        organization_id=org_id,
                        action="SCAN_FAILED",
                        resource_type="scan",
                        resource_id=scan_id,
                        details={"target": target, "error": str(exc)},
                    )
                except Exception:
                    pass

                return {
                    "scan_id": scan_id,
                    "status": "failed",
                    "error": str(exc),
                }

    return _run_async(_execute())


@celery_app.task(name="SageAI.cleanup_old_scans")
def cleanup_old_scans(days: int = 90):
    """Scheduled task to clean up scans older than N days."""
    from datetime import datetime, timedelta, timezone

    async def _cleanup():
        from sqlalchemy import delete

        from app.core.database import AsyncSessionLocal
        from app.models.scan import Scan

        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        async with AsyncSessionLocal() as db:
            result = await db.execute(delete(Scan).where(Scan.created_at < cutoff))
            await db.commit()
            logger.info(
                "Cleaned up %d old scan(s) older than %d days", result.rowcount, days
            )

    _run_async(_cleanup())


@celery_app.task(name="SageAI.asm_scheduled_recon")
def asm_scheduled_recon():
    """Scheduled ASM recon — runs every 12 hours."""
    from app.services.asm.diff_engine import run_asm_diff

    _run_async(run_asm_diff())
    return {"status": "dispatched"}


@celery_app.task(name="SageAI.sync_threat_feeds")
def sync_threat_feeds(force: bool = False):
    """Scheduled task to sync CISA KEV and threat intelligence feeds. Runs daily at 02:30 UTC."""
    from app.services.threat_feed.cve_indexer import cve_indexer

    try:
        count = _run_async(cve_indexer.sync_cisa_kev(force=force))
        patterns = cve_indexer.synthesize_threat_patterns(limit=5)
        logger.info(
            "Threat feed sync completed successfully: %d vulnerabilities indexed, %d pattern sets synthesized",
            count,
            len(patterns),
        )
        return {
            "status": "success",
            "indexed_count": count,
            "patterns_synthesized": len(patterns),
        }
    except Exception as exc:
        logger.error("Threat feed sync failed: %s", exc, exc_info=True)
        return {"status": "failed", "error": str(exc)}
