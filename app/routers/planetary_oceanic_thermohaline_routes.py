"""
FastAPI Router for Planetary Oceanic Thermohaline & Coriolis Induction Supergrid (Option B Wave 65).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.planetary_oceanic_thermohaline_coriolis_induction_supergrid import (
    get_planetary_oceanic_thermohaline_coriolis_induction_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-oceanic-thermohaline",
    tags=["Planetary Oceanic Thermohaline Supergrid"],
)


class HarvestThermohalinePowerRequest(BaseModel):
    current_id: str = Field(..., description="ID of oceanic thermohaline current")
    coriolis_multiplier: Optional[float] = Field(1.05, description="Coriolis induction multiplier")
    lorentz_efficiency: Optional[float] = Field(0.984, description="Lorentz coupling efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")


@router.get("/currents")
async def list_currents():
    service = get_planetary_oceanic_thermohaline_coriolis_induction_supergrid_service()
    return {"currents": service.list_currents()}


@router.post("/harvest-thermohaline-power")
async def harvest_thermohaline_power(request: HarvestThermohalinePowerRequest):
    service = get_planetary_oceanic_thermohaline_coriolis_induction_supergrid_service()
    try:
        return service.harvest_thermohaline_power(
            current_id=request.current_id,
            coriolis_multiplier=request.coriolis_multiplier or 1.05,
            lorentz_efficiency=request.lorentz_efficiency or 0.984,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_planetary_oceanic_thermohaline_coriolis_induction_supergrid_service()
    return service.get_metrics()
