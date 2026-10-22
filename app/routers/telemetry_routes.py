"""Phase 05 Telemetry, Operations Metrics, and DAST API Routes.

Exposes:
- GET /telemetry/traces: Recent trace waterfall overviews
- GET /telemetry/traces/{trace_id}: Full span tree for a distributed trace
- GET /metrics/operations: Real-time operational reliability & SLA metrics
- POST /dast/scan: Two-tier DAST scanner (passive baseline + authorized staging active)
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.telemetry import trace_storage
from app.services.dast.zap_scanner import DASTAuthorizationError, StagedDASTScanner
from app.services.monitoring.metrics_service import get_operational_metrics

router = APIRouter(tags=["Observability & Release Hardening"])


class DASTScanRequest(BaseModel):
    target: str = Field(..., description="Target URL (e.g. https://staging.example.com)")
    mode: str = Field(default="passive", description="'passive' (baseline) or 'active' (staging probes)")
    is_authorized: bool = Field(default=False, description="Whether target is an authorized staging asset")


# ─────────────────────────────────────────────────────────────
# 1. Distributed Traces Endpoints
# ─────────────────────────────────────────────────────────────

@router.get("/telemetry/traces")
async def list_recent_traces(
    limit: int = Query(default=30, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Retrieve recent distributed trace waterfalls with span counts and timing."""
    traces = trace_storage.get_recent_traces(limit=limit)
    return {
        "count": len(traces),
        "traces": traces,
    }


@router.get("/telemetry/traces/{trace_id}")
async def get_trace_waterfall(
    trace_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve all chronological spans for a specific trace ID."""
    spans = trace_storage.get_trace(trace_id)
    if not spans:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trace '{trace_id}' not found in telemetry storage.",
        )

    total_duration = sum(s["duration_ms"] for s in spans)
    return {
        "trace_id": trace_id,
        "span_count": len(spans),
        "total_duration_ms": round(total_duration, 2),
        "spans": spans,
    }


# ─────────────────────────────────────────────────────────────
# 2. Operations & Reliability Metrics Endpoint
# ─────────────────────────────────────────────────────────────

@router.get("/metrics/operations")
async def operational_scorecard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Real-time operational reliability metrics (Queue backlog, Alert SLA, Threat feed freshness)."""
    return await get_operational_metrics(db)


# ─────────────────────────────────────────────────────────────
# 3. Authorized Staging DAST Scanner Endpoint
# ─────────────────────────────────────────────────────────────

@router.post("/dast/scan")
async def run_dast_scan(
    payload: DASTScanRequest,
    current_user: dict = Depends(get_current_user),
):
    """Run staged DAST verification.

    - Mode 'passive': Safe baseline response header, cookie, and disclosure analysis.
    - Mode 'active': Controlled probing restricted strictly to authorized staging assets.
    """
    scanner = StagedDASTScanner()
    try:
        results = await scanner.scan_target(
            target_url=payload.target,
            is_authorized_staging=payload.is_authorized,
            mode=payload.mode.lower(),
        )
        return results
    except DASTAuthorizationError as dae:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(dae),
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DAST scan error: {str(e)}",
        )
