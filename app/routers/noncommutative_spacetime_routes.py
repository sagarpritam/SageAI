"""
FastAPI Router for Capability 103: Non-Commutative Moyal-Weyl Spacetime Phase Space Protector.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.noncommutative_spacetime.noncommutative_spacetime import get_noncommutative_spacetime_protector

router = APIRouter(prefix="/api/noncommutative-spacetime", tags=["Capability 103: Non-Commutative Spacetime"])


class ProtectPhaseSpaceRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the non-commutative manifold")
    theta_adjustment_factor: float = Field(default=1.0, ge=0.2, le=4.0, description="Non-commutativity scale adjustment")
    star_product_order: int = Field(default=4, ge=2, le=8, description="Moyal star product expansion order")
    damping_gain: float = Field(default=1.1, ge=0.8, le=2.5, description="UV/IR mixing damping gain")


@router.get("/manifolds")
async def list_manifolds():
    """List all registered non-commutative manifolds."""
    protector = get_noncommutative_spacetime_protector()
    return {"manifolds": protector.get_manifolds()}


@router.post("/protect-phase-space")
async def protect_phase_space_route(request: ProtectPhaseSpaceRequest):
    """Enforce Moyal star product coordinate commutators and decouple UV/IR mixing."""
    protector = get_noncommutative_spacetime_protector()
    try:
        telemetry = protector.protect_phase_space(
            manifold_id=request.manifold_id,
            theta_adjustment_factor=request.theta_adjustment_factor,
            star_product_order=request.star_product_order,
            damping_gain=request.damping_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_noncommutative_metrics():
    """Retrieve aggregate non-commutative spacetime metrics."""
    protector = get_noncommutative_spacetime_protector()
    return protector.get_noncommutative_metrics()
