"""
FastAPI Router for Capability 120: SYK Maximal Chaos & Schwarzian Scrambling Guard.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.syk_chaos_guard.syk_chaos_guard import get_syk_chaos_guard

router = APIRouter(
    prefix="/api/syk-chaos-guard",
    tags=["Capability 120: SYK Maximal Chaos & Schwarzian Scrambling Guard"],
)


class BoundScramblingRequest(BaseModel):
    ensemble_id: str = Field(..., description="ID of the SYK Majorana ensemble")
    majorana_n: int = Field(
        default=512,
        ge=32,
        le=4096,
        description="Number of Majorana fermion sites N",
    )
    interaction_q: int = Field(
        default=4,
        ge=2,
        le=12,
        description="All-to-all random fermion interaction rank q",
    )
    beta_j_coupling: float = Field(
        default=28.0,
        ge=2.0,
        le=100.0,
        description="Dimensionless inverse-temperature coupling beta * J",
    )
    schwarzian_damping_gain: float = Field(
        default=1.4,
        ge=0.85,
        le=2.5,
        description="IR Schwarzian Goldstone mode damping gain",
    )


@router.get("/ensembles")
async def list_ensembles():
    """List all registered SYK Majorana scrambling ensembles."""
    guard = get_syk_chaos_guard()
    return {"ensembles": guard.get_ensembles()}


@router.post("/bound-scrambling")
async def bound_scrambling_route(request: BoundScramblingRequest):
    """Bound OTOC Lyapunov chaos saturation and stabilize 1D Schwarzian scrambling."""
    guard = get_syk_chaos_guard()
    try:
        return guard.bound_quantum_scrambling(
            ensemble_id=request.ensemble_id,
            majorana_n=request.majorana_n,
            interaction_q=request.interaction_q,
            beta_j_coupling=request.beta_j_coupling,
            schwarzian_damping_gain=request.schwarzian_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_syk_metrics():
    """Retrieve aggregate SYK Maximal Chaos Guard metrics."""
    guard = get_syk_chaos_guard()
    return guard.get_syk_metrics()
