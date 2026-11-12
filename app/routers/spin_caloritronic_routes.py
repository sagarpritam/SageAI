"""
FastAPI Router for Option B Wave 38: Planetary Topological Spin-Seebeck & Magnon-Polariton Harvest Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.spin_caloritronic_power.spin_caloritronic_power import (
    get_spin_caloritronic_power_grid,
)

router = APIRouter(
    prefix="/api/spin-caloritronic-power",
    tags=["Option B Wave 38: Planetary Spin-Caloritronic Magnon-Polariton Power Grid"],
)


class HarvestMagnonRequest(BaseModel):
    array_id: str = Field(
        ..., description="ID of the Spin-Caloritronic Magnon-Polariton array"
    )
    magnon_freq_ghz: float = Field(
        default=42.0,
        ge=12.0,
        le=240.0,
        description="Magnon-polariton BEC frequency (GHz)",
    )
    spin_seebeck_gain: float = Field(
        default=1.5,
        ge=0.8,
        le=2.5,
        description="Inverse spin-Hall Seebeck rectification gain",
    )


@router.get("/arrays")
async def list_arrays():
    """List registered spin-caloritronic magnon-polariton arrays."""
    grid = get_spin_caloritronic_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-magnon")
async def harvest_magnon_route(request: HarvestMagnonRequest):
    """Harvest clean continuous electrical baseload via topological magnon-BEC rectification."""
    grid = get_spin_caloritronic_power_grid()
    try:
        return grid.harvest_magnon_baseload(
            array_id=request.array_id,
            magnon_freq_ghz=request.magnon_freq_ghz,
            spin_seebeck_gain=request.spin_seebeck_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_spin_caloritronic_metrics():
    """Retrieve aggregate Planetary Spin-Caloritronic Magnon-Polariton Grid metrics."""
    grid = get_spin_caloritronic_power_grid()
    return grid.get_spin_caloritronic_metrics()
