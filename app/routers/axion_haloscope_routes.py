"""
FastAPI Router for Option B Wave 32: Planetary Axion-Quasiparticle Haloscope Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.axion_haloscope_power.axion_haloscope_power import (
    get_axion_haloscope_power_grid,
)

router = APIRouter(
    prefix="/api/axion-haloscope-power",
    tags=["Option B Wave 32: Planetary Axion-Quasiparticle Haloscope Grid"],
)


class ResonateHaloscopeRequest(BaseModel):
    array_id: str = Field(
        ..., description="ID of the planetary Primakov axion haloscope array"
    )
    magnetic_field_tesla: float = Field(
        default=14.0,
        ge=8.0,
        le=28.0,
        description="Superconducting solenoidal/toroidal magnetic field in Tesla",
    )
    cavity_quality_q_million: float = Field(
        default=2.8,
        ge=1.0,
        le=8.0,
        description="Loaded microwave cavity quality factor Q_L (in millions)",
    )
    axion_mass_uev: float = Field(
        default=42.0,
        ge=1.0,
        le=250.0,
        description="Resonant axion / axion-quasiparticle mass scale in micro-eV",
    )
    primakov_coupling_gain: float = Field(
        default=1.25,
        ge=0.85,
        le=1.6,
        description="Coherent Primakov E.B phase rectification gain",
    )


@router.get("/arrays")
async def list_arrays():
    """List all registered planetary axion-haloscope power arrays."""
    grid = get_axion_haloscope_power_grid()
    return {"arrays": grid.get_arrays()}


@router.post("/resonate-haloscope")
async def resonate_haloscope_route(request: ResonateHaloscopeRequest):
    """Tune Primakov cavity resonance and rectify zero-carbon clean baseload power."""
    grid = get_axion_haloscope_power_grid()
    try:
        return grid.resonate_haloscope_grid(
            array_id=request.array_id,
            magnetic_field_tesla=request.magnetic_field_tesla,
            cavity_quality_q_million=request.cavity_quality_q_million,
            axion_mass_uev=request.axion_mass_uev,
            primakov_coupling_gain=request.primakov_coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_haloscope_metrics():
    """Retrieve aggregate Planetary Axion-Haloscope Power Grid metrics."""
    grid = get_axion_haloscope_power_grid()
    return grid.get_haloscope_metrics()
