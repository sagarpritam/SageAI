"""
FastAPI Router for Planetary Piezoelectric Tectonic Subduction Supergrid (Option B Wave 64).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.planetary_piezoelectric_tectonic_subduction_supergrid import (
    get_planetary_piezoelectric_tectonic_subduction_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-piezoelectric-tectonic-subduction",
    tags=["Planetary Piezoelectric Subduction Supergrid"],
)


class HarvestTectonicPiezoPowerRequest(BaseModel):
    slab_id: str = Field(..., description="ID of subduction slab piezo array")
    strain_multiplier: Optional[float] = Field(1.05, description="Tectonic strain multiplier")
    piezo_efficiency: Optional[float] = Field(0.982, description="Piezoelectric coupling efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")


@router.get("/slabs")
async def list_slabs():
    service = get_planetary_piezoelectric_tectonic_subduction_supergrid_service()
    return {"slabs": service.list_slabs()}


@router.post("/harvest-tectonic-piezo-power")
async def harvest_tectonic_piezo_power(request: HarvestTectonicPiezoPowerRequest):
    service = get_planetary_piezoelectric_tectonic_subduction_supergrid_service()
    try:
        return service.harvest_tectonic_piezo_power(
            slab_id=request.slab_id,
            strain_multiplier=request.strain_multiplier or 1.05,
            piezo_efficiency=request.piezo_efficiency or 0.982,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_planetary_piezoelectric_tectonic_subduction_supergrid_service()
    return service.get_metrics()
