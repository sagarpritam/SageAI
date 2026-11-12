"""
FastAPI Router for Option B Wave 33: Superradiant Penrose-Blandford-Znajek Ergosphere Spin-Extraction Power Matrix.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ergosphere_spin_power.ergosphere_spin_power import (
    get_ergosphere_spin_power_grid,
)

router = APIRouter(
    prefix="/api/ergosphere-spin-power",
    tags=["Option B Wave 33: Superradiant Penrose-BZ Ergosphere Power Matrix"],
)


class ExtractTorqueRequest(BaseModel):
    rotor_id: str = Field(..., description="ID of the Penrose-BZ ergosphere rotor")
    spin_a_star: float = Field(
        default=0.985,
        ge=0.75,
        le=0.998,
        description="Dimensionless Kerr spin parameter a_* = J / (GM^2 / c)",
    )
    magnetic_flux_wb: float = Field(
        default=5.0e6,
        ge=1.0e6,
        le=1.0e7,
        description="Poloidal superconducting horizon magnetic flux in Webers",
    )
    flux_coupling_gain: float = Field(
        default=1.45,
        ge=0.85,
        le=2.5,
        description="Blandford-Znajek impedance-matched flux coupling gain",
    )
    superradiant_mode_m: int = Field(
        default=2,
        ge=1,
        le=6,
        description="Azimuthal superradiant extraction harmonic index m",
    )


@router.get("/rotors")
async def list_rotors():
    """List all registered planetary Penrose-BZ ergosphere rotors."""
    grid = get_ergosphere_spin_power_grid()
    return {"rotors": grid.get_rotors()}


@router.post("/extract-torque")
async def extract_torque_route(request: ExtractTorqueRequest):
    """Harvest zero-carbon Blandford-Znajek electromagnetic torque from ergosphere rotors."""
    grid = get_ergosphere_spin_power_grid()
    try:
        return grid.extract_ergosphere_torque(
            rotor_id=request.rotor_id,
            spin_a_star=request.spin_a_star,
            magnetic_flux_wb=request.magnetic_flux_wb,
            flux_coupling_gain=request.flux_coupling_gain,
            superradiant_mode_m=request.superradiant_mode_m,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_ergosphere_metrics():
    """Retrieve aggregate Superradiant Penrose-BZ Power Grid metrics."""
    grid = get_ergosphere_spin_power_grid()
    return grid.get_ergosphere_metrics()
