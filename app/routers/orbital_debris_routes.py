"""
FastAPI Router for Orbital Anti-Satellite (ASAT) Kinetic Debris Laser Ablation & Trajectory Deflector.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.orbital_debris.orbital_debris_deflector import orbital_asat_debris_deflector

router = APIRouter(
    prefix="/orbital-debris",
    tags=["Orbital ASAT Kinetic Debris Laser Deflector"],
)


class CalculateConjunctionRequest(BaseModel):
    platform_id: str = Field(..., description="Target spaceborne laser platform ID")
    debris_size_cm: float = Field(..., description="Hypervelocity debris diameter in centimeters")
    relative_velocity_km_s: float = Field(7.8, description="Relative collision closing velocity in km/s")
    miss_distance_meters: float = Field(..., description="Predicted unmitigated miss distance in meters")
    collision_probability: float = Field(..., description="Calculated orbital collision probability")


class FireLaserDeflectorRequest(BaseModel):
    platform_id: str = Field(..., description="Target platform to discharge pulsed laser")
    target_debris_id: str = Field("DEBRIS-LEO-8821", description="Catalog ID of targeted space debris")
    pulse_count: int = Field(50, description="Laser burst pulse count")
    laser_fluence_j_cm2: float = Field(12.5, description="Optical laser fluence in J/cm2")


@router.get("/platforms")
@limiter.limit("60/minute")
async def list_platforms_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored spaceborne laser debris deflector platforms."""
    return {"status": "success", "platforms": orbital_asat_debris_deflector.list_platforms()}


@router.get("/platforms/{platform_id}")
@limiter.limit("60/minute")
async def get_platform_endpoint(
    request: Request,
    platform_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific orbital laser platform."""
    platform = orbital_asat_debris_deflector.get_platform(platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Orbital laser platform not found")
    return {"status": "success", "platform": platform}


@router.post("/calculate-conjunction")
@limiter.limit("60/minute")
async def calculate_conjunction_endpoint(
    request: Request,
    body: CalculateConjunctionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Calculates orbital conjunction collision risks and required delta-v deflection."""
    try:
        verdict = orbital_asat_debris_deflector.calculate_debris_conjunction(
            platform_id=body.platform_id,
            debris_size_cm=body.debris_size_cm,
            relative_velocity_km_s=body.relative_velocity_km_s,
            miss_distance_meters=body.miss_distance_meters,
            collision_probability=body.collision_probability,
        )
        return {"status": "success", "conjunction": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fire-deflector")
@limiter.limit("30/minute")
async def fire_deflector_endpoint(
    request: Request,
    body: FireLaserDeflectorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Discharges sub-1.8ms pulsed laser ablation bursts inducing vaporization recoil delta-v."""
    try:
        result = orbital_asat_debris_deflector.fire_laser_ablation_deflector(
            platform_id=body.platform_id,
            target_debris_id=body.target_debris_id,
            pulse_count=body.pulse_count,
            laser_fluence_j_cm2=body.laser_fluence_j_cm2,
        )
        return {"status": "success", "deflection_event": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_debris_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet telemetry for orbital kinetic debris laser deflector."""
    return {"status": "success", "metrics": orbital_asat_debris_deflector.get_debris_metrics()}

