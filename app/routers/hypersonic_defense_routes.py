"""
FastAPI Router for Autonomous Multi-Sensor Hypersonic Glide Vehicle (HGV) Trajectory Tracker & Interceptor.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.hypersonic_defense.hypersonic_interceptor import (
    hypersonic_interceptor,
)

router = APIRouter(
    prefix="/hypersonic-defense",
    tags=["Autonomous Multi-Sensor Hypersonic Trajectory Tracker & Interceptor"],
)


class TrackGlidePathRequest(BaseModel):
    threat_id: str = Field(..., description="Target hypersonic threat identifier")
    measured_mach: float = Field(..., description="Measured flight velocity in Mach")
    altitude_km: float = Field(..., description="Flight altitude in kilometers")
    skip_glide_detected: bool = Field(
        ..., description="Whether non-ballistic skip-glide bounce is detected"
    )
    plasma_blackout_active: bool = Field(
        ..., description="Whether plasma sheath ionization blackout is detected"
    )


class FireHypersonicInterceptorRequest(BaseModel):
    threat_id: str = Field(..., description="Target hypersonic threat identifier")
    interceptor_type: str = Field(
        "DIRECTED_ENERGY_OPTICAL_LASER_EKV", description="Interceptor weapon type"
    )
    fire_control_latency_ms: float = Field(
        2.1, description="Fire-control solution latency in milliseconds"
    )


@router.get("/threats")
@limiter.limit("60/minute")
async def list_threats_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored hypersonic maneuver threats."""
    return {"status": "success", "threats": hypersonic_interceptor.list_threats()}


@router.get("/threats/{threat_id}")
@limiter.limit("60/minute")
async def get_threat_endpoint(
    request: Request,
    threat_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific hypersonic threat."""
    threat = hypersonic_interceptor.get_threat(threat_id)
    if not threat:
        raise HTTPException(status_code=404, detail="Hypersonic threat not found")
    return {"status": "success", "threat": threat}


@router.post("/track-glide-path")
@limiter.limit("60/minute")
async def track_glide_path_endpoint(
    request: Request,
    body: TrackGlidePathRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Fuses multi-sensor telemetry to predict non-ballistic glide trajectories and plasma blackout boundaries."""
    try:
        verdict = hypersonic_interceptor.track_hypersonic_glide_path(
            threat_id=body.threat_id,
            measured_mach=body.measured_mach,
            altitude_km=body.altitude_km,
            skip_glide_detected=body.skip_glide_detected,
            plasma_blackout_active=body.plasma_blackout_active,
        )
        return {"status": "success", "tracking": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fire-interceptor")
@limiter.limit("30/minute")
async def fire_interceptor_endpoint(
    request: Request,
    body: FireHypersonicInterceptorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Computes sub-2.4ms fire control solution and discharges directed-energy or kinetic EKV intercept."""
    try:
        result = hypersonic_interceptor.fire_hypersonic_interceptor(
            threat_id=body.threat_id,
            interceptor_type=body.interceptor_type,
            fire_control_latency_ms=body.fire_control_latency_ms,
        )
        return {"status": "success", "interception": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_hypersonic_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns hypersonic glide vehicle defense metrics."""
    return {
        "status": "success",
        "metrics": hypersonic_interceptor.get_hypersonic_defense_metrics(),
    }
