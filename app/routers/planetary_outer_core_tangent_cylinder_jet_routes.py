"""
FastAPI Router for Planetary Outer-Core Tangent Cylinder Jet Supergrid (Option B Wave 58).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.planetary_outer_core_tangent_cylinder_jet_supergrid import (
    get_planetary_outer_core_tangent_cylinder_jet_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-outer-core-tangent-cylinder-jet",
    tags=["Planetary Outer-Core Tangent Cylinder Jet Supergrid"],
)

class HarvestTangentJetPowerRequest(BaseModel):
    array_id: str = Field(..., description="ID of Tangent Cylinder array to harvest")
    jet_velocity_override_km_yr: Optional[float] = Field(42.5, description="Jet velocity override in km/year")
    mhd_induction_efficiency: Optional[float] = Field(0.95, description="MHD induction stator efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")

@router.get("/arrays")
async def list_arrays():
    service = get_planetary_outer_core_tangent_cylinder_jet_supergrid_service()
    return {"arrays": service.list_arrays()}

@router.post("/harvest-tangent-jet-power")
async def harvest_tangent_jet_power(request: HarvestTangentJetPowerRequest):
    service = get_planetary_outer_core_tangent_cylinder_jet_supergrid_service()
    try:
        return service.harvest_tangent_jet_power(
            array_id=request.array_id,
            jet_velocity_override_km_yr=request.jet_velocity_override_km_yr or 42.5,
            mhd_induction_efficiency=request.mhd_induction_efficiency or 0.95,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_planetary_outer_core_tangent_cylinder_jet_supergrid_service()
    return service.get_metrics()
