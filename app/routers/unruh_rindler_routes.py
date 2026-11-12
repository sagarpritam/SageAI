"""
FastAPI Router for Option B (Wave 35): Planetary Unruh-Rindler Vacuum Thermal Bath Power Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.unruh_rindler_power.unruh_rindler_power import (
    get_unruh_rindler_power_grid,
)

router = APIRouter(
    prefix="/api/unruh-rindler-power",
    tags=["Option B Wave 35: Planetary Unruh-Rindler Thermal Bath Power Grid"],
)


class HarvestUnruhRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Unruh-Rindler rectifier array")
    cavity_frequency_ghz: float = Field(
        default=34.0,
        ge=10.0,
        le=180.0,
        description="Superconducting Josephson cavity resonance frequency in GHz",
    )
    rectifier_gain: float = Field(
        default=1.45,
        ge=0.85,
        le=2.5,
        description="Fulling-Davies-Unruh Bogoliubov coherent rectification gain",
    )


@router.get("/arrays")
async def list_arrays():
    """List all registered Unruh-Rindler thermal rectifier arrays."""
    grid = get_unruh_rindler_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-unruh")
async def harvest_unruh_route(request: HarvestUnruhRequest):
    """Harvest clean electrical baseload from Fulling-Davies-Unruh Rindler bath modes."""
    grid = get_unruh_rindler_power_grid()
    try:
        return grid.harvest_unruh_baseload(
            array_id=request.array_id,
            cavity_frequency_ghz=request.cavity_frequency_ghz,
            rectifier_gain=request.rectifier_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_unruh_rindler_metrics():
    """Retrieve aggregate Unruh-Rindler power grid metrics."""
    grid = get_unruh_rindler_power_grid()
    return grid.get_unruh_rindler_metrics()
