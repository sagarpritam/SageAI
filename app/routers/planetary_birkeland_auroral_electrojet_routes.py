"""
FastAPI Router for Planetary Magnetospheric Birkeland Current & Auroral Electrojet Supergrid (Option B Wave 62).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.planetary_magnetospheric_birkeland_auroral_electrojet_supergrid import (
    get_planetary_magnetospheric_birkeland_auroral_electrojet_supergrid_service,
)

router = APIRouter(
    prefix="/api/planetary-birkeland-auroral-electrojet",
    tags=["Planetary Birkeland Auroral Electrojet Supergrid"],
)


class HarvestBirkelandElectrojetPowerRequest(BaseModel):
    electrojet_id: str = Field(..., description="ID of Birkeland auroral electrojet node")
    current_multiplier_override: Optional[float] = Field(1.05, description="Field-aligned current multiplier")
    tether_efficiency: Optional[float] = Field(0.975, description="Tether efficiency")
    dispatch_duration_s: Optional[float] = Field(60.0, description="Dispatch duration in seconds")


@router.get("/electrojets")
async def list_electrojets():
    service = get_planetary_magnetospheric_birkeland_auroral_electrojet_supergrid_service()
    return {"electrojets": service.list_electrojets()}


@router.post("/harvest-birkeland-electrojet-power")
async def harvest_birkeland_electrojet_power(request: HarvestBirkelandElectrojetPowerRequest):
    service = get_planetary_magnetospheric_birkeland_auroral_electrojet_supergrid_service()
    try:
        return service.harvest_birkeland_electrojet_power(
            electrojet_id=request.electrojet_id,
            current_multiplier_override=request.current_multiplier_override or 1.05,
            tether_efficiency=request.tether_efficiency or 0.975,
            dispatch_duration_s=request.dispatch_duration_s or 60.0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_planetary_magnetospheric_birkeland_auroral_electrojet_supergrid_service()
    return service.get_metrics()
