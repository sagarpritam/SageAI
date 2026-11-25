"""
FastAPI Router for Planetary Telluric Schumann Cavity Waveguide Supergrid (Option B Wave 63).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.planetary_telluric_schumann_cavity_waveguide_supergrid import (
    get_planetary_telluric_schumann_cavity_waveguide_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-telluric-schumann-cavity",
    tags=["Planetary Telluric Schumann Cavity Supergrid"],
)


class HarvestSchumannCavityPowerRequest(BaseModel):
    cavity_id: str = Field(..., description="ID of Schumann cavity node")
    q_factor_multiplier: Optional[float] = Field(1.05, description="Resonance Q-factor multiplier")
    waveguide_efficiency: Optional[float] = Field(0.98, description="Waveguide efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")


@router.get("/cavities")
async def list_cavities():
    service = get_planetary_telluric_schumann_cavity_waveguide_supergrid_service()
    return {"cavities": service.list_cavities()}


@router.post("/harvest-schumann-cavity-power")
async def harvest_schumann_cavity_power(request: HarvestSchumannCavityPowerRequest):
    service = get_planetary_telluric_schumann_cavity_waveguide_supergrid_service()
    try:
        return service.harvest_schumann_cavity_power(
            cavity_id=request.cavity_id,
            q_factor_multiplier=request.q_factor_multiplier or 1.05,
            waveguide_efficiency=request.waveguide_efficiency or 0.98,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_planetary_telluric_schumann_cavity_waveguide_supergrid_service()
    return service.get_metrics()
