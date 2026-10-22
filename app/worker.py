"""SageAI Celery Worker Entrypoint.

Usage:
    celery -A app.worker worker --loglevel=info --concurrency=4
    celery -A app.worker beat --loglevel=info
"""

import logging

from app.tasks import asm_scheduled_recon, celery_app, cleanup_old_scans, run_scan_task

logger = logging.getLogger("SageAI.worker")
logger.info("Initializing SageAI Distributed Ephemeral Scanner Worker Fleet...")

__all__ = [
    "celery_app",
    "run_scan_task",
    "cleanup_old_scans",
    "asm_scheduled_recon",
]
