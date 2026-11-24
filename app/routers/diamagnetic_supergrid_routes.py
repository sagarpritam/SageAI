"""
FastAPI Router for Option B Wave 46: Planetary Room-Temperature Diamagnetic & Meissner-Levitation Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.room_temp_diamagnetic_supergrid.room_temp_diamagnetic_supergrid import (
    get_room_temp_diamagnetic_supergrid,
)

router = APIRouter(
    prefix="/api/room-temp-diamagnetic-supergrid",
    tags=["Option B Wave 46: Room-Temperature Diamagnetic Supergrid"],
)


class HarvestDiamagneticRequest(BaseModel):
    array_id: str = Field(
        ..., description="ID of the room-temperature diamagnetic supergrid array"
    )
    meissner_field_tesla: float = Field(
        default=14.5,
        ge=1.0,
        le=120.0,
        description="Meissner levitation magnetic induction in Tesla",
    )
    levitation_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Diamagnetic levitation coherence multiplier",
    )


@router.get("/arrays")
async def list_diamagnetic_arrays():
    """List registered room-temperature diamagnetic supergrid arrays."""
    sg = get_room_temp_diamagnetic_supergrid()
    return {"arrays": sg.get_arrays()}


@router.post("/harvest-diamagnetic")
async def harvest_diamagnetic_route(request: HarvestDiamagneticRequest):
    """Harvest baseload power via macroscopic Meissner-effect levitation and Cu-substituted lead-apatite channels."""
    sg = get_room_temp_diamagnetic_supergrid()
    try:
        return sg.harvest_diamagnetic_baseload(
            array_id=request.array_id,
            meissner_field_tesla=request.meissner_field_tesla,
            levitation_gain=request.levitation_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_diamagnetic_metrics_route():
    """Return aggregate Room-Temperature Diamagnetic Supergrid metrics."""
    sg = get_room_temp_diamagnetic_supergrid()
    return sg.get_grid_metrics()
