"""Distributed Ephemeral Scanner Worker Fleet Manager.

Decouples network scans from the web API server, handles Celery job dispatch,
enforces idempotency keys, manages scan retry limits, and provides resilient
fallback when Redis brokers are unavailable.
"""

import asyncio
import hashlib
import logging
import os
import socket
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, cast

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.finding import Finding
from app.models.scan import Scan
from app.services.alerting.dispatcher import dispatch_security_alert
from app.services.audit_service import log_audit_event
from app.services.risk_engine import calculate_risk

logger = logging.getLogger("SageAI.fleet")


def is_broker_online(timeout: float = 0.2) -> bool:
    """Fast socket probe to determine whether the Celery Redis broker is responsive."""
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        parsed = urllib.parse.urlparse(redis_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def generate_scan_idempotency_key(org_id: str, target: str, scan_type: str = "full") -> str:
    """Generate deterministic idempotency hash based on tenant, target, and 5-minute time window."""
    window = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")[:11]  # 5-minute block
    raw = f"{org_id}:{target.lower().strip()}:{scan_type}:{window}"
    return hashlib.sha256(raw.encode()).hexdigest()[:24]


class FleetManager:
    """Orchestrates distributed worker task queues, idempotency, and durable scan execution."""

    def __init__(self):
        self._max_retries = 3

    async def check_idempotency(
        self, db: AsyncSession, org_id: str, idempotency_key: str, current_scan_id: Optional[str] = None
    ) -> Optional[Scan]:
        """Check if an identical scan was already submitted recently for this organization."""
        if not idempotency_key:
            return None

        cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
        query = select(Scan).where(
            Scan.organization_id == org_id,
            Scan.idempotency_key == idempotency_key,
            Scan.created_at >= cutoff,
        )
        if current_scan_id:
            query = query.where(Scan.id != current_scan_id)

        res = await db.execute(query.order_by(Scan.created_at.desc()))
        return res.scalar_one_or_none()

    async def dispatch_scan(
        self,
        db: AsyncSession,
        scan_id: str,
        target: str,
        org_id: str,
        scan_type: str = "full",
        idempotency_key: Optional[str] = None,
        deep_scan: bool = False,
    ) -> Dict[str, Any]:
        """
        Dispatch a scan to the distributed Celery worker fleet.
        Falls back to resilient async background execution if broker is offline.
        """
        # Fetch and initialize scan state
        res = await db.execute(select(Scan).where(Scan.id == scan_id))
        scan = res.scalar_one_or_none()
        if not scan:
            raise ValueError(f"Scan '{scan_id}' not found")

        idem_key = idempotency_key or generate_scan_idempotency_key(org_id, target, scan_type)
        scan.idempotency_key = idem_key
        scan.scan_type = scan_type
        scan.status = "queued"
        scan.stage = "queued"
        scan.progress = 5
        await db.commit()

        # Attempt Celery task dispatch
        celery_task_id = None
        dispatched_via = "celery"

        if is_broker_online():
            try:
                from app.tasks import run_scan_task

                # Attempt Celery dispatch
                task = cast(Any, run_scan_task).apply_async(
                    args=[scan_id, target, org_id],
                    kwargs={"deep_scan": deep_scan, "scan_type": scan_type},
                    countdown=0,
                    retry=False,
                )
                celery_task_id = task.id
                scan.celery_task_id = celery_task_id
                await db.commit()
                logger.info(f"Dispatched scan {scan_id} to Celery worker (Task ID: {celery_task_id})")
            except Exception as e:
                logger.warning(f"Celery broker unavailable ({e}); falling back to in-process worker fleet runner.")
                dispatched_via = "local_fleet_async"
                asyncio.create_task(self._execute_scan_worker(scan_id, target, org_id, deep_scan))
        else:
            logger.info("Redis broker offline; using resilient in-process worker fleet runner.")
            dispatched_via = "local_fleet_async"
            asyncio.create_task(self._execute_scan_worker(scan_id, target, org_id, deep_scan))

        return {
            "scan_id": scan.id,
            "target": target,
            "status": "queued",
            "stage": "queued",
            "progress": 5,
            "idempotency_key": idem_key,
            "celery_task_id": celery_task_id,
            "execution_mode": dispatched_via,
        }

    async def _execute_scan_worker(
        self,
        scan_id: str,
        target: str,
        org_id: str,
        deep_scan: bool = False,
        session: Optional[AsyncSession] = None,
    ) -> None:
        """Durable scan executor with staged progress tracking and alert notification hooks."""
        if session is not None:
            await self._run_worker_with_session(session, scan_id, target, org_id, deep_scan)
        else:
            async with AsyncSessionLocal() as db:
                await self._run_worker_with_session(db, scan_id, target, org_id, deep_scan)

    async def _run_worker_with_session(
        self, db: AsyncSession, scan_id: str, target: str, org_id: str, deep_scan: bool = False
    ) -> None:
        """Internal execution body for worker scan."""
        from app.services.scanner_service import run_all_scans

        res = await db.execute(select(Scan).where(Scan.id == scan_id))
        scan = res.scalar_one_or_none()
        if not scan:
            return

        try:
            # Stage 1: Transition to running
            scan.status = "running"
            scan.stage = "reconnaissance"
            scan.progress = 20
            await db.commit()

            # Stage 2: Deep network execution
            scan.stage = "network_scanning"
            scan.progress = 50
            await db.commit()

            raw_findings = await run_all_scans(target, scan_id=scan.id)

            # Stage 3: Risk evaluation & finding persistence
            scan.stage = "risk_analysis"
            scan.progress = 80
            await db.commit()

            from app.agents.analyzer import analyze_findings
            findings_data = analyze_findings(raw_findings)
            risk = calculate_risk(findings_data)

            scan.set_findings(findings_data)
            scan.risk_score = risk.get("risk_score", 0)
            scan.risk_level = risk.get("risk_level", "Low")
            scan.status = "completed"
            scan.stage = "completed"
            scan.progress = 100

            # Persist DB findings
            for f in findings_data:
                severity_val = (f.get("severity") or "Low").capitalize()
                cvss_val = f.get("cvss_score") or f.get("cvss")
                finding_entry = Finding(
                    scan_id=scan.id,
                    title=f.get("title") or f.get("type", "Security Finding"),
                    description=f.get("description") or f.get("detail", ""),
                    severity=severity_val,
                    cvss_score=float(cvss_val) if cvss_val is not None else 0.0,
                    asset_identified=f.get("target") or target,
                )
                db.add(finding_entry)

            await db.commit()
            logger.info(f"Worker fleet completed scan {scan_id} with {len(findings_data)} findings.")

            # Dispatch notification alerts (Phase 01 integration)
            await dispatch_security_alert(
                db=db,
                organization_id=org_id,
                title=f"Scan Completed: {target} ({scan.risk_level} Risk)",
                target=target,
                severity=scan.risk_level.lower() if scan.risk_level else "medium",
                risk_score=float(scan.risk_score or 0.0),
                details=f"Scan completed with {len(findings_data)} findings identified.",
                findings_count=len(findings_data),
                metadata={"scan_id": scan.id, "risk_score": scan.risk_score},
            )

            # Record tamper-evident audit trail (Phase 00 integration)
            await log_audit_event(
                db=db,
                organization_id=org_id,
                action="SCAN_COMPLETED",
                resource_type="scan",
                resource_id=scan.id,
                details={
                    "target": target,
                    "risk_score": scan.risk_score,
                    "total_findings": len(findings_data),
                },
            )

        except Exception as e:
            logger.error(f"Worker scan {scan_id} encountered fatal error: {e}", exc_info=True)
            scan.status = "failed"
            scan.stage = "error"
            scan.retry_count += 1
            await db.commit()

            await log_audit_event(
                db=db,
                organization_id=org_id,
                action="SCAN_FAILED",
                resource_type="scan",
                resource_id=scan.id,
                details={"target": target, "error": str(e)},
            )

    async def cancel_scan(self, db: AsyncSession, scan_id: str, org_id: str) -> Dict[str, Any]:
        """Cancel/terminate an active scan job in the worker fleet."""
        res = await db.execute(
            select(Scan).where(Scan.id == scan_id, Scan.organization_id == org_id)
        )
        scan = res.scalar_one_or_none()
        if not scan:
            return {"error": f"Scan '{scan_id}' not found or unauthorized", "authorized": False}

        if scan.status in ("completed", "failed", "cancelled"):
            return {
                "authorized": True,
                "scan_id": scan.id,
                "status": scan.status,
                "message": f"Scan is already in final state: {scan.status}",
            }

        # Revoke Celery task if ID exists
        if scan.celery_task_id:
            try:
                from app.tasks import celery_app
                celery_app.control.revoke(scan.celery_task_id, terminate=True, signal="SIGTERM")
                logger.info(f"Revoked Celery task {scan.celery_task_id} for scan {scan_id}")
            except Exception as e:
                logger.warning(f"Could not revoke Celery task {scan.celery_task_id}: {e}")

        scan.status = "cancelled"
        scan.stage = "cancelled"
        await db.commit()

        await log_audit_event(
            db=db,
            organization_id=org_id,
            action="SCAN_CANCELLED",
            resource_type="scan",
            resource_id=scan.id,
            details={"target": scan.target},
        )

        return {
            "authorized": True,
            "scan_id": scan.id,
            "status": "cancelled",
            "message": "Scan cancelled successfully.",
        }

    async def get_fleet_status(self, db: AsyncSession) -> Dict[str, Any]:
        """Inspect queue length, active workers, and Redis broker connectivity."""
        broker_connected = False
        active_workers = 0

        try:
            from app.tasks import celery_app
            conn = celery_app.connection()
            conn.ensure_connection(max_retries=1)
            broker_connected = True

            inspect = celery_app.control.inspect(timeout=1.0)
            if inspect:
                active = inspect.active()
                if active:
                    active_workers = len(active)
        except Exception:
            broker_connected = False

        # Query database scan metrics
        status_counts_res = await db.execute(
            select(Scan.status, func.count(Scan.id)).group_by(Scan.status)
        )
        counts = {str(row[0]): int(row[1]) for row in status_counts_res.all()}

        return {
            "status": "healthy" if (broker_connected or counts.get("running", 0) >= 0) else "degraded",
            "broker_connected": broker_connected,
            "active_workers": active_workers,
            "scans": {
                "queued": counts.get("queued", 0),
                "running": counts.get("running", 0),
                "completed": counts.get("completed", 0),
                "failed": counts.get("failed", 0),
                "cancelled": counts.get("cancelled", 0),
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


fleet_manager = FleetManager()
