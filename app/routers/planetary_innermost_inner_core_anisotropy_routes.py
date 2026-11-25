"""
FastAPI Router for Planetary Innermost Inner Core (IMIC) Anisotropic Lattice Supergrid (Option B Wave 59).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.planetary_innermost_inner_core_anisotropy_supergrid import (
    get_planetary_innermost_inner_core_anisotropy_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-innermost-inner-core-anisotropy",
    tags=["Planetary Innermost Inner Core Anisotropy Supergrid"],
)

class HarvestInnermostCorePowerRequest(BaseModel):
    array_id: str = Field(..., description="ID of IMIC array to dispatch power from")
    anisotropy_factor_override: Optional[float] = Field(3.2, description="Anisotropy factor percentage")
    piezo_coupling_efficiency: Optional[float] = Field(0.95, description="Piezo coupling efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")

@router.get("/arrays")
async def list_arrays():
    service = get_planetary_innermost_inner_core_anisotropy_supergrid_service()
    return {"arrays": service.list_arrays()}

@router.post("/harvest-innermost-core-power")
async def harvest_innermost_core_power(request: HarvestInnermostCorePowerRequest):
    service = get_planetary_innermost_inner_core_anisotropy_supergrid_service()
    try:
        return service.harvest_innermost_core_power(
            array_id=request.array_id,
            anisotropy_factor_override=request.anisotropy_factor_override if request.anisotropy_factor_override is not None else 3.2,
            piezo_coupling_efficiency=request.piezo_coupling_efficiency if request.piezo_coupling_efficiency is not None else 0.95,
            dispatch_duration_s=request.dispatch_duration_s if request.dispatch_duration_s is not None else 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_planetary_innermost_inner_core_anisotropy_supergrid_service()
    return service.get_metrics()
