"""
FastAPI Router for Option B Wave 40: Planetary Non-Hermitian PT-Symmetric & Quantum Ratchet Power Grid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quantum_thermoelectric_ratchet.quantum_thermoelectric_ratchet import (
    get_quantum_thermoelectric_ratchet_grid,
)

router = APIRouter(
    prefix="/api/quantum-thermoelectric-power",
    tags=["Option B Wave 40: Non-Hermitian Quantum Ratchet Power Grid"],
)


class HarvestRatchetRequest(BaseModel):
    harvester_id: str = Field(..., description="ID of the quantum ratchet harvester")
    bath_gradient_kelvin: float = Field(
        default=420.0,
        ge=50.0,
        le=2500.0,
        description="Effective non-Hermitian thermal bath gradient in Kelvin",
    )
    nonhermitian_gain: float = Field(
        default=1.6,
        ge=0.8,
        le=2.5,
        description="Hatano-Nelson skin-effect rectification gain",
    )


@router.get("/harvesters")
async def list_ratchet_harvesters():
    """List registered non-Hermitian quantum thermal ratchet harvesters."""
    grid = get_quantum_thermoelectric_ratchet_grid()
    return {"harvesters": grid.get_harvesters()}


@router.post("/harvest-ratchet")
async def harvest_ratchet_route(request: HarvestRatchetRequest):
    """Synchronize non-Hermitian skin-effect arrays to harvest clean baseload."""
    grid = get_quantum_thermoelectric_ratchet_grid()
    try:
        return grid.harvest_ratchet_baseload(
            harvester_id=request.harvester_id,
            bath_gradient_kelvin=request.bath_gradient_kelvin,
            nonhermitian_gain=request.nonhermitian_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_ratchet_metrics():
    """Retrieve aggregate Planetary Quantum Thermoelectric Ratchet Grid metrics."""
    grid = get_quantum_thermoelectric_ratchet_grid()
    return grid.get_ratchet_metrics()
