"""
FastAPI Router for Autonomous 5G/6G Core Network Micro-Slicing & Open-RAN (O-RAN) Defense Mesh.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.telecom_5g_ran.telecom_5g_slice_guard import telecom_5g_slice_guard

router = APIRouter(
    prefix="/telecom-5g",
    tags=["Autonomous 5G/6G Core Micro-Slicing & Open-RAN Mesh"],
)


class RanAnomalyRequest(BaseModel):
    slice_id: str = Field(..., description="Target 5G slice identifier")
    radio_signal_dbm: float = Field(..., description="Measured RSRP signal strength in dBm")
    pci_collision: Optional[bool] = Field(False, description="Physical Cell ID collision flag")
    unexpected_rnti: Optional[bool] = Field(False, description="Radio Network Temporary Identifier anomaly flag")


class QuarantineSliceRequest(BaseModel):
    slice_id: str = Field(..., description="Slice to isolate")
    reason: str = Field("Adversary intrusion detected", description="Reason for quarantine")


@router.get("/slices")
@limiter.limit("60/minute")
async def list_slices_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all 3GPP 5G/6G core network slices."""
    return {"status": "success", "slices": telecom_5g_slice_guard.list_slices()}


@router.get("/slices/{slice_id}")
@limiter.limit("60/minute")
async def get_slice_endpoint(
    request: Request,
    slice_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves specific 5G/6G network slice telemetry."""
    slc = telecom_5g_slice_guard.get_slice(slice_id)
    if not slc:
        raise HTTPException(status_code=404, detail="Network slice not found")
    return {"status": "success", "slice": slc}


@router.post("/detect-anomaly")
@limiter.limit("60/minute")
async def detect_anomaly_endpoint(
    request: Request,
    body: RanAnomalyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes O-RAN Near-RT RIC telemetry for jamming or rogue gNodeB spoofing."""
    try:
        verdict = telecom_5g_slice_guard.detect_ran_anomalies(
            slice_id=body.slice_id,
            radio_signal_dbm=body.radio_signal_dbm,
            pci_collision=body.pci_collision or False,
            unexpected_rnti=body.unexpected_rnti or False,
        )
        return {"status": "success", "analysis": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/quarantine-slice")
@limiter.limit("30/minute")
async def quarantine_slice_endpoint(
    request: Request,
    body: QuarantineSliceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Quarantines an impacted 5G network slice and diverts active radio bearers."""
    try:
        res = telecom_5g_slice_guard.quarantine_slice(body.slice_id, body.reason)
        return {"status": "success", "quarantine": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns 5G/6G RAN and Core health metrics."""
    return {"status": "success", "metrics": telecom_5g_slice_guard.get_telecom_metrics()}

