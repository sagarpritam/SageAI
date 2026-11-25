"""
FastAPI Router for Planetary Geomagnetic Reversal & Multipole Flux Capacitor Supergrid (Option B Wave 61).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.planetary_geomagnetic_reversal_flux_capacitor_supergrid import (
    get_planetary_geomagnetic_reversal_flux_capacitor_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-geomagnetic-reversal-flux-capacitor",
    tags=["Planetary Geomagnetic Reversal Flux Capacitor Supergrid"],
)


class HarvestGeomagneticReversalPowerRequest(BaseModel):
    capacitor_id: str = Field(..., description="ID of geomagnetic flux capacitor node")
    multipole_order_override: Optional[int] = Field(3, description="Multipole harmonic order override")
    lorentz_coupling_efficiency: Optional[float] = Field(0.97, description="Lorentz coupling efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")


@router.get("/capacitors")
async def list_capacitors():
    service = get_planetary_geomagnetic_reversal_flux_capacitor_supergrid_service()
    return {"capacitors": service.list_capacitors()}


@router.post("/harvest-geomagnetic-reversal-power")
async def harvest_geomagnetic_reversal_power(request: HarvestGeomagneticReversalPowerRequest):
    service = get_planetary_geomagnetic_reversal_flux_capacitor_supergrid_service()
    try:
        return service.harvest_geomagnetic_reversal_power(
            capacitor_id=request.capacitor_id,
            multipole_order_override=request.multipole_order_override or 3,
            lorentz_coupling_efficiency=request.lorentz_coupling_efficiency or 0.97,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_planetary_geomagnetic_reversal_flux_capacitor_supergrid_service()
    return service.get_metrics()
