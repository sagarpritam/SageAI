"""
FastAPI Router for Option B Wave 49: Planetary Ultra-Dense Rydberg Exciton-Polariton Condensate Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rydberg_polariton_supergrid.rydberg_polariton_supergrid import (
    get_rydberg_polariton_supergrid_service,
)

router = APIRouter(
    prefix="/api/rydberg-polariton-supergrid",
    tags=["Option B Wave 49: Rydberg Polariton Supergrid"],
)


class HarvestPolaritonRequest(BaseModel):
    cavity_id: str = Field(..., description="ID of the Rydberg polariton cavity array")
    exciton_fraction_pct: float = Field(
        default=50.0,
        gt=0.0,
        lt=100.0,
        description="Hopfield exciton fraction percentage",
    )
    pump_fluence_uj_cm2: float = Field(
        default=120.0,
        gt=0.0,
        le=1000.0,
        description="Optical parametric oscillator pump fluence (uJ/cm^2)",
    )
    superfluid_coupling_gain: float = Field(
        default=1.15,
        ge=0.5,
        le=3.0,
        description="Gross-Pitaevskii polariton superfluid gain",
    )
    temperature_k: float = Field(
        default=295.0, ge=4.0, le=350.0, description="Ambient operating temperature (K)"
    )


@router.get("/cavities")
async def list_rydberg_cavities():
    """List registered Rydberg polariton cavity arrays."""
    svc = get_rydberg_polariton_supergrid_service()
    return {"cavities": svc.get_cavities()}


@router.post("/harvest-polariton")
async def harvest_rydberg_polariton(request: HarvestPolaritonRequest):
    """Harvest zero-dissipation electric power from Rydberg polariton BEC condensate."""
    svc = get_rydberg_polariton_supergrid_service()
    try:
        return svc.harvest_polariton(
            cavity_id=request.cavity_id,
            exciton_fraction_pct=request.exciton_fraction_pct,
            pump_fluence_uj_cm2=request.pump_fluence_uj_cm2,
            superfluid_coupling_gain=request.superfluid_coupling_gain,
            temperature_k=request.temperature_k,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_rydberg_polariton_metrics():
    """Return aggregate telemetry metrics for Rydberg polariton supergrid."""
    svc = get_rydberg_polariton_supergrid_service()
    return svc.get_metrics()
