"""
FastAPI Router for Capability 160: Geometric Satake Equivalence & Affine Springer Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.geometric_satake_affine.geometric_satake_affine import (
    get_geometric_satake_affine_shield,
)

router = APIRouter(
    prefix="/api/geometric-satake-affine",
    tags=["Capability 160: Geometric Satake Affine Shield"],
)


class SealGeometricSatakeRequest(BaseModel):
    stack_id: str = Field(
        ..., description="ID of the Geometric Satake affine Grassmannian stack"
    )
    group_rank: int = Field(
        default=4, ge=1, le=16, description="Reductive algebraic group rank"
    )
    strata_dimension: int = Field(
        default=12,
        ge=2,
        le=64,
        description="Schubert variety perverse sheaf strata dimension",
    )
    springer_fiber_depth: int = Field(
        default=6,
        ge=2,
        le=32,
        description="Nilpotent orbital integral affine Springer fiber depth",
    )
    satake_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Tannakian Satake convolution gain multiplier",
    )


@router.get("/stacks")
async def list_satake_stacks():
    """List registered Geometric Satake affine Grassmannian stacks."""
    satake = get_geometric_satake_affine_shield()
    return {"stacks": satake.get_stacks()}


@router.post("/seal-satake")
async def seal_geometric_satake_route(request: SealGeometricSatakeRequest):
    """Verify geometric Satake convolution products and lock affine Springer nilpotent orbital integrals."""
    satake = get_geometric_satake_affine_shield()
    try:
        return satake.seal_geometric_satake(
            stack_id=request.stack_id,
            group_rank=request.group_rank,
            strata_dimension=request.strata_dimension,
            springer_fiber_depth=request.springer_fiber_depth,
            satake_gain=request.satake_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_satake_metrics_route():
    """Return aggregate Geometric Satake Affine Shield telemetry."""
    satake = get_geometric_satake_affine_shield()
    return satake.get_satake_metrics()
