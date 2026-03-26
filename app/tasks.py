"""Celery task queue configuration for async scan processing.

Usage:
  - Start worker: celery -A app.tasks.celery_app worker --loglevel=info
  - Start beat (scheduled): celery -A app.tasks.celery_app beat --loglevel=info
"""

import os
import asyncio
import logging
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
        }
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


@celery_app.task(bind=True, name="SageAI.run_scan")
def run_scan_task(self, scan_id: str, target: str, org_id: str):
    """Async scan task — runs security checks in a background worker.

    Updates the Scan DB record with results on completion or failure.
    """
    from app.services.scanner_service import run_all_scans
    from app.services.risk_engine import calculate_risk

    async def _execute():
        from app.core.database import AsyncSessionLocal
        from app.models.scan import Scan
        from app.models.finding import Finding
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            try:
                self.update_state(state="SCANNING", meta={"target": target})
                logger.info("Task %s: scanning %s", scan_id, target)

                findings = await run_all_scans(target, scan_id=scan_id, db=db)
                risk = calculate_risk(findings)

                # Update scan record
                result = await db.execute(select(Scan).where(Scan.id == scan_id))
                scan = result.scalar_one_or_none()

                if scan:
                    scan.set_findings(findings)
                    scan.risk_score = risk["risk_score"]
                    scan.risk_level = risk["risk_level"]
                    scan.status = "completed"

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
                    logger.info("Task %s: completed with %d findings", scan_id, len(findings))

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
                        await db.commit()
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
        from app.core.database import AsyncSessionLocal
        from app.models.scan import Scan
        from sqlalchemy import select, delete

        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                delete(Scan).where(Scan.created_at < cutoff)
            )
            await db.commit()
            logger.info("Cleaned up %d old scan(s) older than %d days", result.rowcount, days)

    _run_async(_cleanup())


@celery_app.task(name="SageAI.asm_scheduled_recon")
def asm_scheduled_recon():
    """Scheduled ASM recon — runs every 12 hours."""
    from app.services.asm.diff_engine import run_asm_diff

    _run_async(run_asm_diff())
    return {"status": "dispatched"}
