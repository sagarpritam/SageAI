"""
FastAPI Router for Sovereign Spaceborne Megawatt-Class Directed Energy Plasma Shield Network.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.services.plasma_shield_network import spaceborne_plasma_shield

router = APIRouter(
    prefix="/plasma-shield",
    tags=["Spaceborne Directed Energy Plasma Shield Network"],
)


class EngagePlasmaWindowRequest(BaseModel):
    platform_id: str = Field(..., description="Target spaceborne plasma shield platform ID")
    target_threat_id: str = Field(..., description="Identifier of incoming hypervelocity threat")
    incoming_velocity_km_s: float = Field(8.5, description="Closing velocity of threat in km/s")
    estimated_threat_mass_kg: float = Field(45.0, description="Estimated projectile mass in kg")


class FireDeflectionPulseRequest(BaseModel):
    platform_id: str = Field(..., description="Target spaceborne plasma platform ID")
    target_threat_id: str = Field(..., description="Target threat ID to ablate and deflect")
    pulse_energy_mj: float = Field(120.0, description="Discharged beam pulse energy in megajoules")
    beam_diameter_cm: float = Field(15.0, description="Beam optical diameter in cm")


@router.get("/platforms")
@limiter.limit("60/minute")
async def list_platforms_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered spaceborne plasma shield platforms."""
    return {"status": "success", "platforms": spaceborne_plasma_shield.list_platforms()}


@router.get("/platforms/{platform_id}")
@limiter.limit("60/minute")
async def get_platform_endpoint(
    request: Request,
    platform_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves telemetry of a specific orbital plasma shield platform."""
    platform = spaceborne_plasma_shield.get_platform(platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail=f"Platform {platform_id} not found.")
    return {"status": "success", "platform": platform}


@router.post("/engage-window")
@limiter.limit("30/minute")
async def engage_window_endpoint(
    request: Request,
    payload: EngagePlasmaWindowRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Activates magnetic confinement dense plasma window standoff."""
    try:
        window_event = spaceborne_plasma_shield.engage_plasma_window(
            platform_id=payload.platform_id,
            target_threat_id=payload.target_threat_id,
            incoming_velocity_km_s=payload.incoming_velocity_km_s,
            estimated_threat_mass_kg=payload.estimated_threat_mass_kg,
        )
        return {"status": "success", "window_event": window_event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fire-pulse")
@limiter.limit("30/minute")
async def fire_pulse_endpoint(
    request: Request,
    payload: FireDeflectionPulseRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Discharges relativistic electron beam ablation pulse to deflect kinetic kill vehicle."""
    try:
        deflection_event = spaceborne_plasma_shield.fire_deflection_pulse(
            platform_id=payload.platform_id,
            target_threat_id=payload.target_threat_id,
            pulse_energy_mj=payload.pulse_energy_mj,
            beam_diameter_cm=payload.beam_diameter_cm,
        )
        return {"status": "success", "deflection_event": deflection_event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves spaceborne plasma shield fleet metrics."""
    return {"status": "success", "metrics": spaceborne_plasma_shield.get_metrics()}

