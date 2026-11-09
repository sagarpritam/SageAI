"""
FastAPI Router for Autonomous Air-Defense & Kinetic Drone Swarm RF/Optical Directed-Energy Shield.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.drone_swarm_shield.kinetic_drone_shield import kinetic_drone_shield

router = APIRouter(
    prefix="/drone-swarm-shield",
    tags=[
        "Autonomous Air-Defense & Kinetic Drone Swarm RF/Optical Directed-Energy Shield"
    ],
)


class DetectSwarmRequest(BaseModel):
    site_id: str = Field(..., description="Target protected facility identifier")
    radar_rcs_m2: float = Field(..., description="Radar Cross Section measured in m²")
    swarm_size: int = Field(
        ..., description="Estimated drone units in incoming swarm formation"
    )
    optical_confirmed: bool = Field(
        ..., description="Whether electro-optical/thermal target lock is confirmed"
    )
    rf_spectrum_anomaly: bool = Field(
        ..., description="Whether anomalous RF control link is active"
    )
    approach_velocity_mps: float = Field(
        65.0, description="Swarm approach velocity in meters per second"
    )


class FireDirectedEnergyRequest(BaseModel):
    site_id: str = Field(..., description="Target protected facility identifier")
    weapon_type: str = Field(
        "HIGH_POWER_MICROWAVE_HPM", description="Directed energy weapon type"
    )
    burst_duration_ms: float = Field(
        4.2, description="Pulse burst duration in milliseconds"
    )


@router.get("/sites")
@limiter.limit("60/minute")
async def list_sites_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored critical airspace defense sites."""
    return {"status": "success", "sites": kinetic_drone_shield.list_protected_sites()}


@router.get("/sites/{site_id}")
@limiter.limit("60/minute")
async def get_site_endpoint(
    request: Request,
    site_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific protected airspace defense site."""
    site = kinetic_drone_shield.get_site(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Protected airspace site not found")
    return {"status": "success", "site": site}


@router.post("/detect-swarm")
@limiter.limit("60/minute")
async def detect_swarm_endpoint(
    request: Request,
    body: DetectSwarmRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Fuses radar, optical, and RF telemetry to detect inbound hostile drone swarms."""
    try:
        verdict = kinetic_drone_shield.detect_drone_swarm(
            site_id=body.site_id,
            radar_rcs_m2=body.radar_rcs_m2,
            swarm_size=body.swarm_size,
            optical_confirmed=body.optical_confirmed,
            rf_spectrum_anomaly=body.rf_spectrum_anomaly,
            approach_velocity_mps=body.approach_velocity_mps,
        )
        return {"status": "success", "detection": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fire-directed-energy")
@limiter.limit("30/minute")
async def fire_directed_energy_endpoint(
    request: Request,
    body: FireDirectedEnergyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes sub-5ms High-Power Microwave or Laser directed-energy pulse to fry swarm avionics."""
    try:
        result = kinetic_drone_shield.fire_directed_energy_burst(
            site_id=body.site_id,
            weapon_type=body.weapon_type,
            burst_duration_ms=body.burst_duration_ms,
        )
        return {"status": "success", "interception": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_drone_shield_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns kinetic drone swarm air defense metrics."""
    return {
        "status": "success",
        "metrics": kinetic_drone_shield.get_drone_shield_metrics(),
    }
