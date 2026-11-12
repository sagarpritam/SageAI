"""
FastAPI Router for Option B Wave 39: Planetary Topological Berry-Curvature & Nonlinear Hall Harvest Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.berry_curvature_power.berry_curvature_power import (
    get_berry_curvature_power_grid,
)

router = APIRouter(
    prefix="/api/berry-curvature-power",
    tags=["Option B Wave 39: Planetary Berry-Curvature Harvest Grid"],
)


class HarvestBerryRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Berry-curvature harvest array")
    terahertz_pump_thz: float = Field(
        default=1.8, ge=0.5, le=25.0, description="Terahertz pump excitation (THz)"
    )
    berry_dipole_gain: float = Field(
        default=1.5,
        ge=0.8,
        le=2.5,
        description="Nonlinear quantum Hall dipole rectification gain",
    )


@router.get("/arrays")
async def list_berry_arrays():
    """List registered Berry-curvature nonlinear Hall harvest arrays."""
    grid = get_berry_curvature_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-berry")
async def harvest_berry_route(request: HarvestBerryRequest):
    """Harvest clean continuous electrical baseload via Berry-curvature Hall rectification."""
    grid = get_berry_curvature_power_grid()
    try:
        return grid.harvest_berry_baseload(
            array_id=request.array_id,
            terahertz_pump_thz=request.terahertz_pump_thz,
            berry_dipole_gain=request.berry_dipole_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_berry_curvature_metrics():
    """Retrieve aggregate Planetary Berry-Curvature & Nonlinear Hall Grid metrics."""
    grid = get_berry_curvature_power_grid()
    return grid.get_berry_curvature_metrics()
