"""
FastAPI Routes for Planetary F-Layer Inner-Core Slurry Stratification Supergrid (Option B Wave 57).
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.planetary_f_layer_slurry_supergrid import (
    get_planetary_f_layer_slurry_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-f-layer-slurry-supergrid",
    tags=["Planetary F-Layer Slurry Supergrid"],
)


class HarvestSlurryPowerRequest(BaseModel):
    array_id: str = Field("F-LAYER-PACIFIC-SEDIMENT-01", description="Identifier of the F-layer slurry harvesting array")
    sedimentation_rate_override_mm_yr: float = Field(2.5, ge=0.1, le=20.0, description="Iron-snow sedimentation rate in mm/yr")
    magnetostrictive_efficiency: float = Field(0.95, ge=0.5, le=1.0, description="Telluric magnetostrictive extraction efficiency")
    dispatch_duration_s: float = Field(60.0, ge=1.0, le=86400.0, description="Baseload dispatch duration in seconds")


@router.get("/arrays", summary="List Planetary F-Layer Slurry Arrays")
async def list_arrays(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_planetary_f_layer_slurry_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-slurry-power", summary="Harvest F-Layer Sedimentation & Slurry Power")
async def harvest_slurry_power(
    req: HarvestSlurryPowerRequest,
    _user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    svc = get_planetary_f_layer_slurry_supergrid_service()
    return svc.harvest_slurry_power(
        array_id=req.array_id,
        sedimentation_rate_override_mm_yr=req.sedimentation_rate_override_mm_yr,
        magnetostrictive_efficiency=req.magnetostrictive_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics", summary="Get Planetary F-Layer Supergrid Telemetry Metrics")
async def get_metrics(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_planetary_f_layer_slurry_supergrid_service()
    return svc.get_metrics()
