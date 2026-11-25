"""
FastAPI router for Option B Wave 56: Planetary Inner-Core Boundary (ICB) Dendritic Solidification Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.icb_dendritic_solidification_supergrid import (
    get_icb_dendritic_solidification_supergrid_service,
)

router = APIRouter(
    prefix="/api/icb-dendritic-solidification-supergrid",
    tags=["ICB Dendritic Solidification Supergrid"],
)


class HarvestLatentHeatRequest(BaseModel):
    array_id: str = Field(..., description="ID of the ICB dendritic solidus array")
    crystallization_rate_override_mm_yr: float = Field(
        default=1.5, ge=0.1, le=5.0, description="hcp epsilon-Fe crystallization rate in mm/year"
    )
    thermo_acoustic_efficiency: float = Field(
        default=0.95, ge=0.5, le=1.0, description="Thermo-acoustic energy extraction efficiency"
    )
    dispatch_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Baseload electrical power dispatch duration"
    )


@router.get("/arrays")
async def list_icb_arrays():
    """List registered Inner-Core Boundary dendritic solidification arrays."""
    svc = get_icb_dendritic_solidification_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-latent-heat")
async def harvest_latent_heat(request: HarvestLatentHeatRequest):
    """Harvest baseload power from ICB dendritic latent heat and compositional buoyancy."""
    svc = get_icb_dendritic_solidification_supergrid_service()
    try:
        return svc.harvest_latent_heat(
            array_id=request.array_id,
            crystallization_rate_override_mm_yr=request.crystallization_rate_override_mm_yr,
            thermo_acoustic_efficiency=request.thermo_acoustic_efficiency,
            dispatch_duration_s=request.dispatch_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_icb_supergrid_metrics():
    """Get operational telemetry metrics for ICB dendritic latent heat supergrid."""
    svc = get_icb_dendritic_solidification_supergrid_service()
    return svc.get_metrics()
