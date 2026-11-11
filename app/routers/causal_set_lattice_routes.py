"""
FastAPI Router for Capability 112: Causal Set Discrete Spacetime Poset Lattice Guard.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.causal_set_lattice.causal_set_lattice import (
    get_causal_set_lattice_guard,
)

router = APIRouter(
    prefix="/api/causal-set-lattice",
    tags=["Capability 112: Causal Set Discrete Spacetime Lattice"],
)


class EnforcePosetRequest(BaseModel):
    poset_id: str = Field(
        ..., description="ID of the discrete causal set spacetime poset"
    )
    sprinkling_density_factor: float = Field(
        default=1.25,
        ge=0.5,
        le=5.0,
        description="Normalized Lorentz-invariant Poisson sprinkling density rho",
    )
    target_dimension_d: float = Field(
        default=4.0,
        ge=2.0,
        le=6.0,
        description="Target Myrheim-Meyer emergent spacetime dimension d",
    )
    transitivity_damping_gain: float = Field(
        default=1.15,
        ge=0.8,
        le=2.5,
        description="Partial-order transitivity enforcement gain",
    )


@router.get("/posets")
async def list_posets():
    """List all registered discrete causal set spacetime posets."""
    guard = get_causal_set_lattice_guard()
    return {"posets": guard.get_posets()}


@router.post("/enforce-poset")
async def enforce_poset_route(request: EnforcePosetRequest):
    """Enforce causal poset partial order and verify Myrheim-Meyer dimension."""
    guard = get_causal_set_lattice_guard()
    try:
        return guard.enforce_causal_poset(
            poset_id=request.poset_id,
            sprinkling_density_factor=request.sprinkling_density_factor,
            target_dimension_d=request.target_dimension_d,
            transitivity_damping_gain=request.transitivity_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_causal_metrics():
    """Retrieve aggregate discrete causal set lattice metrics."""
    guard = get_causal_set_lattice_guard()
    return guard.get_causal_metrics()
