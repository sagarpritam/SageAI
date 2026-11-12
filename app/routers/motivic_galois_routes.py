"""
FastAPI Router for Capability 138: Motivic Galois Group & Voevodsky Mixed-Tate Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.motivic_galois_cohomology.motivic_galois_cohomology import (
    get_motivic_galois_shield,
)

router = APIRouter(
    prefix="/api/motivic-galois-cohomology",
    tags=["Capability 138: Motivic Galois Cohomology Shield"],
)


class SealMotivicCycleRequest(BaseModel):
    motive_id: str = Field(..., description="ID of the motivic cohomology complex")
    tate_twist_weight: int = Field(
        default=4, ge=1, le=32, description="Tate twist Z(n) weight"
    )
    beilinson_regulator_order: int = Field(
        default=6, ge=2, le=48, description="Beilinson regulator harmonic order"
    )
    hodge_filtration_rank: int = Field(
        default=8, ge=2, le=64, description="Mixed Hodge-Tate filtration rank"
    )
    motivic_gain: float = Field(
        default=1.5, ge=0.85, le=2.5, description="Cosmic Galois clamping gain"
    )


@router.get("/motives")
async def list_motives():
    """List registered motivic cohomology complexes."""
    shield = get_motivic_galois_shield()
    return {"motives": shield.get_motives()}


@router.post("/seal-motive")
async def seal_motive_route(request: SealMotivicCycleRequest):
    """Seal Voevodsky algebraic cycles and clamp Beilinson period drift."""
    shield = get_motivic_galois_shield()
    try:
        return shield.seal_motivic_cycle(
            motive_id=request.motive_id,
            tate_twist_weight=request.tate_twist_weight,
            beilinson_regulator_order=request.beilinson_regulator_order,
            hodge_filtration_rank=request.hodge_filtration_rank,
            motivic_gain=request.motivic_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_motivic_metrics():
    """Retrieve aggregate Motivic Galois Cohomology Shield metrics."""
    shield = get_motivic_galois_shield()
    return shield.get_motivic_metrics()
