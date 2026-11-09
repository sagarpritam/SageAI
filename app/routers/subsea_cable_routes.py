"""
FastAPI Router for Deep-Sea Subsea Fiber-Optic Cable Acoustic & Optical Tap Sensor Interceptor.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.subsea_telecom.subsea_cable_guard import subsea_cable_guard

router = APIRouter(
    prefix="/subsea-cable",
    tags=["Deep-Sea Subsea Fiber-Optic Cable Interception Defense"],
)


class InspectTelemetryRequest(BaseModel):
    cable_id: str = Field(..., description="Target submarine cable trunk")
    otdr_db_loss: float = Field(..., description="Coherent OTDR measured attenuation in dB/km")
    sop_rotation_rad_s: float = Field(..., description="State of Polarization rotation rate in rad/s")
    das_acoustic_db: float = Field(..., description="Distributed Acoustic Sensing hydrophone noise level in dB")


class SeveranceRequest(BaseModel):
    cable_id: str = Field(..., description="Cable trunk to loopback sever")
    reason: str = Field("Physical ROV tap detected", description="Reason for autonomous severance")


@router.get("/cables")
@limiter.limit("60/minute")
async def list_cables_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored submarine fiber-optic trunks."""
    return {"status": "success", "cables": subsea_cable_guard.list_cables()}


@router.get("/cables/{cable_id}")
@limiter.limit("60/minute")
async def get_cable_endpoint(
    request: Request,
    cable_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific subsea cable trunk."""
    cbl = subsea_cable_guard.get_cable(cable_id)
    if not cbl:
        raise HTTPException(status_code=404, detail="Subsea cable trunk not found")
    return {"status": "success", "cable": cbl}


@router.post("/inspect-telemetry")
@limiter.limit("60/minute")
async def inspect_telemetry_endpoint(
    request: Request,
    body: InspectTelemetryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes OTDR, polarization shifts, and acoustic hydrophone signals for physical taps."""
    try:
        verdict = subsea_cable_guard.inspect_optical_telemetry(
            cable_id=body.cable_id,
            otdr_db_loss=body.otdr_db_loss,
            sop_rotation_rad_s=body.sop_rotation_rad_s,
            das_acoustic_db=body.das_acoustic_db,
        )
        return {"status": "success", "inspection": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/trigger-severance")
@limiter.limit("30/minute")
async def trigger_severance_endpoint(
    request: Request,
    body: SeveranceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes sub-15ms optical repeater loopback severance and traffic reroute."""
    try:
        res = subsea_cable_guard.trigger_autonomous_severance(body.cable_id, body.reason)
        return {"status": "success", "severance": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_subsea_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns subsea fiber infrastructure protection metrics."""
    return {"status": "success", "metrics": subsea_cable_guard.get_subsea_metrics()}

