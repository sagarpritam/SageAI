"""
FastAPI Router for Option B (Wave 34): Planetary Dynamical Casimir-Sagnac Power Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.casimir_sagnac_power.casimir_sagnac_power import (
    get_casimir_sagnac_power_grid,
)

router = APIRouter(
    prefix="/api/casimir-sagnac-power",
    tags=["Option B Wave 34: Planetary Dynamical Casimir-Sagnac Power Grid"],
)


class HarvestSagnacRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Casimir-Sagnac cavity array")
    pump_frequency_mhz: float = Field(
        default=420.0,
        ge=100.0,
        le=2400.0,
        description="Parametric boundary modulation frequency in MHz",
    )
    squeeze_gain: float = Field(
        default=1.4,
        ge=0.85,
        le=2.5,
        description="Dynamical Casimir quadrature squeezing amplification gain",
    )


@router.get("/arrays")
async def list_arrays():
    """List all registered Dynamical Casimir-Sagnac cavity arrays."""
    grid = get_casimir_sagnac_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/harvest-sagnac")
async def harvest_sagnac_route(request: HarvestSagnacRequest):
    """Drive dynamical Casimir squeezing around Sagnac ring cavities for clean power."""
    grid = get_casimir_sagnac_power_grid()
    try:
        return grid.harvest_sagnac_baseload(
            array_id=request.array_id,
            pump_frequency_mhz=request.pump_frequency_mhz,
            squeeze_gain=request.squeeze_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_casimir_sagnac_metrics():
    """Retrieve aggregate Casimir-Sagnac power grid metrics."""
    grid = get_casimir_sagnac_power_grid()
    return grid.get_casimir_sagnac_metrics()
