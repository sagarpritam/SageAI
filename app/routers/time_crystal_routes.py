"""
FastAPI Router for Option B Wave 37: Planetary Floquet Time-Crystal Josephson Superconducting Power Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.time_crystal_power.time_crystal_power import (
    get_time_crystal_power_grid,
)

router = APIRouter(
    prefix="/api/time-crystal-power",
    tags=["Option B Wave 37: Planetary Floquet Time-Crystal Josephson Power Grid"],
)


class HarvestSubharmonicRequest(BaseModel):
    array_id: str = Field(
        ..., description="ID of the Floquet Time-Crystal Josephson array"
    )
    shapiro_freq_ghz: float = Field(
        default=34.0,
        ge=10.0,
        le=200.0,
        description="Shapiro-step drive frequency (GHz)",
    )
    ratchet_gain: float = Field(
        default=1.5,
        ge=0.8,
        le=2.5,
        description="Josephson flux-ratchet rectification gain",
    )


@router.get("/arrays")
async def list_arrays():
    """List registered Floquet Time-Crystal Josephson arrays."""
    grid = get_time_crystal_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-subharmonic")
async def harvest_subharmonic_route(request: HarvestSubharmonicRequest):
    """Harvest continuous clean electrical baseload via subharmonic Josephson rectification."""
    grid = get_time_crystal_power_grid()
    try:
        return grid.harvest_subharmonic_baseload(
            array_id=request.array_id,
            shapiro_freq_ghz=request.shapiro_freq_ghz,
            ratchet_gain=request.ratchet_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_time_crystal_metrics():
    """Retrieve aggregate Planetary Floquet Time-Crystal Josephson Power Grid metrics."""
    grid = get_time_crystal_power_grid()
    return grid.get_time_crystal_metrics()
