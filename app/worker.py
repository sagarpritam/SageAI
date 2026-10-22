"""SageAI Celery Worker Entrypoint.

Usage:
    celery -A app.worker worker --loglevel=info --concurrency=4
    celery -A app.worker beat --loglevel=info
"""

import logging
import os

from app.tasks import celery_app, run_scan_task, cleanup_old_scans, asm_scheduled_recon

logger = logging.getLogger("SageAI.worker")
logger.info("Initializing SageAI Distributed Ephemeral Scanner Worker Fleet...")

__all__ = [
    "celery_app",
    "run_scan_task",
    "cleanup_old_scans",
    "asm_scheduled_recon",
]
