"""
FastAPI Router for Capability 144: Geometric Satake Equivalence & Kashiwara Crystal Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.geometric_satake_kashiwara.geometric_satake_kashiwara import (
    get_geometric_satake_shield,
)

router = APIRouter(
    prefix="/api/geometric-satake-kashiwara",
    tags=["Capability 144: Geometric Satake & Kashiwara Crystal Shield"],
)


class SealSatakeRequest(BaseModel):
    sheaf_id: str = Field(..., description="ID of the Geometric Satake perverse sheaf")
    dual_group_rank: int = Field(
        default=4, ge=2, le=16, description="Langlands dual group rank"
    )
    crystal_operator_depth: int = Field(
        default=14, ge=4, le=128, description="Kashiwara crystal operator depth"
    )
    mv_polytope_vertices: int = Field(
        default=12, ge=4, le=64, description="Mirkovic-Vilonen polytope vertex count"
    )
    satake_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Satake perverse equivalence gain"
    )


@router.get("/sheaves")
async def list_satake_sheaves():
    """List registered Geometric Satake perverse sheaves."""
    sh = get_geometric_satake_shield()
    return {"sheaves": sh.get_sheaves()}


@router.post("/seal-crystal")
async def seal_satake_crystal_route(request: SealSatakeRequest):
    """Seal Mirkovic-Vilonen perverse sheaves and Kashiwara crystal operators."""
    sh = get_geometric_satake_shield()
    try:
        return sh.seal_satake_crystal(
            sheaf_id=request.sheaf_id,
            dual_group_rank=request.dual_group_rank,
            crystal_operator_depth=request.crystal_operator_depth,
            mv_polytope_vertices=request.mv_polytope_vertices,
            satake_gain=request.satake_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_satake_metrics():
    """Retrieve aggregate Geometric Satake & Kashiwara Crystal Shield metrics."""
    sh = get_geometric_satake_shield()
    return sh.get_satake_metrics()
