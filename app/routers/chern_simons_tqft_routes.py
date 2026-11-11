"""
FastAPI Router for Capability 113: Witten Chern-Simons 3-Manifold TQFT & Jones Knot Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.chern_simons_tqft.chern_simons_tqft import (
    get_chern_simons_tqft_shield,
)

router = APIRouter(
    prefix="/api/chern-simons-tqft",
    tags=["Capability 113: Witten Chern-Simons 3-Manifold TQFT & Jones Knot Shield"],
)


class EvaluateInvariantRequest(BaseModel):
    manifold_id: str = Field(
        ..., description="ID of the Chern-Simons 3-manifold & knot topology"
    )
    gauge_rank_n: int = Field(
        default=2,
        ge=2,
        le=8,
        description="SU(N) Chern-Simons gauge group rank N",
    )
    chern_simons_level_k: int = Field(
        default=8,
        ge=2,
        le=32,
        description="Integer quantized Chern-Simons level k",
    )
    knot_crossings: int = Field(
        default=4,
        ge=3,
        le=18,
        description="Knot/link crossing number for Jones/HOMFLY-PT skein invariant",
    )
    framing_counterterm_gain: float = Field(
        default=1.2,
        ge=0.8,
        le=2.5,
        description="Gravitational Chern-Simons framing counterterm gain",
    )


@router.get("/manifolds")
async def list_manifolds():
    """List all registered Chern-Simons 3-manifold topologies."""
    shield = get_chern_simons_tqft_shield()
    return {"manifolds": shield.get_manifolds()}


@router.post("/evaluate-invariant")
async def evaluate_invariant_route(request: EvaluateInvariantRequest):
    """Evaluate SU(N)_k partition function Z(M_3) & Jones knot invariant."""
    shield = get_chern_simons_tqft_shield()
    try:
        return shield.evaluate_invariant(
            manifold_id=request.manifold_id,
            gauge_rank_n=request.gauge_rank_n,
            chern_simons_level_k=request.chern_simons_level_k,
            knot_crossings=request.knot_crossings,
            framing_counterterm_gain=request.framing_counterterm_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_tqft_metrics():
    """Retrieve aggregate Chern-Simons TQFT invariant metrics."""
    shield = get_chern_simons_tqft_shield()
    return shield.get_tqft_metrics()
