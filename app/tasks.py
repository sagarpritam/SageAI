"""Celery task queue configuration for async scan processing.

Usage:
  - Start worker: celery -A app.tasks.celery_app worker --loglevel=info
  - Start beat (scheduled): celery -A app.tasks.celery_app beat --loglevel=info
"""

import os
from celery import Celery
from celery.schedules import crontab

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
            "schedule": crontab(minute=0, hour='*/12'),  # Every 12 hours
        }
    }
)


@celery_app.task(bind=True, name="SageAI.run_scan")
def run_scan_task(self, scan_id: str, target: str, org_id: str):
    """
    Async scan task — runs security checks in background.

    This is a Celery task that can be called from the API to offload
    long-running scans to a worker process.

    Usage from API:
        from app.tasks import run_scan_task
        run_scan_task.delay(scan_id, target, org_id)
    """
    import asyncio
    from app.services.scanner_service import run_all_scans
    from app.services.risk_engine import calculate_risk

    try:
        self.update_state(state="SCANNING", meta={"target": target})

        # Run the async scan in a new event loop
        findings = asyncio.get_event_loop().run_until_complete(run_all_scans(target))
        risk = calculate_risk(findings)

        return {
            "scan_id": scan_id,
            "status": "completed",
            "findings": findings,
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
        }
    except Exception as e:
        return {
            "scan_id": scan_id,
            "status": "failed",
            "error": str(e),
        }


@celery_app.task(name="SageAI.cleanup_old_scans")
def cleanup_old_scans(days: int = 90):
    """Scheduled task to clean up scans older than N days."""
    # This would be called by Celery Beat
    pass

@celery_app.task(name="SageAI.asm_scheduled_recon")
def asm_scheduled_recon():
    """
    Scheduled task that orchestrates the Continuous Attack Surface Management (ASM).
    Runs every 12 hours to:
    1. Fetch all active organizations and their root domains.
    2. Dispatch recon workflows (Subfinder/Amass/Shodan).
    3. Push results to the ASM diff engine.
    """
    import asyncio
    from app.services.asm.diff_engine import run_asm_diff
    
    # Needs a new event loop inside celery
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run_asm_diff())
    return {"status": "dispatched"}

