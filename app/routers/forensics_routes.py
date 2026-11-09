"""
FastAPI Router for Autonomous Live Forensics & Volatility Acquisition Engine.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.forensics.forensics_service import forensics_service

router = APIRouter(prefix="/forensics", tags=["Autonomous Live Forensics & Volatility Acquisition"])


class AcquireForensicsRequest(BaseModel):
    target_host: Optional[str] = Field("prod-k8s-node-04", description="Designated host to acquire volatile memory from")


class TimelineRequest(BaseModel):
    container_id: str = Field(..., description="Forensic evidence container ID to build timeline for")


@router.post("/acquire")
@limiter.limit("30/minute")
async def acquire_forensics_endpoint(
    request: Request,
    payload: AcquireForensicsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes live memory acquisition, process tree inspection, and shellcode carving."""
    user_id = str(current_user.get("sub", "SecOpsForensicInvestigator"))
    try:
        bundle = forensics_service.acquire_volatile_memory(
            target_host=payload.target_host or "prod-k8s-node-04",
            operator=user_id,
        )
        return {"status": "success", "forensic_bundle": bundle}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/timeline")
@limiter.limit("30/minute")
async def generate_timeline_endpoint(
    request: Request,
    payload: TimelineRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes a chronological incident timeline from acquired volatile forensic evidence."""
    try:
        timeline = forensics_service.generate_timeline(container_id=payload.container_id)
        return {"status": "success", "timeline": timeline}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

