"""
FastAPI Router for Capability 123: Non-Lorentzian Carrollian & Ultrarelativistic Null-Boundary Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.carrollian_holography.carrollian_holography import (
    get_carrollian_holography_shield,
)

router = APIRouter(
    prefix="/api/carrollian-holography",
    tags=["Capability 123: Non-Lorentzian Carrollian Null-Boundary Shield"],
)


class SealCarrollianRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the Carrollian manifold profile")
    carroll_coupling: float = Field(
        default=0.94,
        ge=0.5,
        le=1.0,
        description="Ultralocal Carrollian electric/magnetic coupling factor",
    )
    dipole_charge: float = Field(
        default=4.0,
        ge=1.0,
        le=16.0,
        description="Fracton conserved dipole moment index",
    )
    null_clamp_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Null infinity I+ lightcone collapse stabilization gain",
    )


@router.get("/manifolds")
async def list_manifolds():
    """List all registered Carrollian null-boundary manifolds."""
    shield = get_carrollian_holography_shield()
    return {"manifolds": shield.get_manifolds()}


@router.post("/seal-carrollian")
async def seal_carrollian_route(request: SealCarrollianRequest):
    """Seal ultralocal c->0 Carrollian cones and enforce Fracton dipole conservation."""
    shield = get_carrollian_holography_shield()
    try:
        return shield.seal_carrollian_boundary(
            manifold_id=request.manifold_id,
            carroll_coupling=request.carroll_coupling,
            dipole_charge=request.dipole_charge,
            null_clamp_gain=request.null_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_carrollian_metrics():
    """Retrieve aggregate Carrollian null-boundary shield metrics."""
    shield = get_carrollian_holography_shield()
    return shield.get_carrollian_metrics()
