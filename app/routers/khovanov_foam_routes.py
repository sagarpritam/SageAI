"""
FastAPI Router for Capability 152: Khovanov Homology & Foam Cobordism Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.khovanov_foam_cobordism.khovanov_foam_cobordism import (
    get_khovanov_foam_shield,
)

router = APIRouter(
    prefix="/api/khovanov-foam-cobordism",
    tags=["Capability 152: Khovanov Homology & Foam Cobordism"],
)


class SealKhovanovRequest(BaseModel):
    knot_id: str = Field(..., description="ID of the Khovanov knot complex")
    knot_rank: int = Field(
        default=4, ge=2, le=16, description="Khovanov-Rozansky sl(N) rank"
    )
    crossing_depth: int = Field(
        default=12, ge=4, le=64, description="Knot projection crossing depth"
    )
    foam_facets: int = Field(
        default=14, ge=4, le=128, description="Bar-Natan foam 2-morphism facets"
    )
    khovanov_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Rasmussen s-invariant gain multiplier",
    )


@router.get("/knots")
async def list_khovanov_knots():
    """List registered Khovanov Homology & Foam complexes."""
    sh = get_khovanov_foam_shield()
    return {"knots": sh.get_knots()}


@router.post("/seal-khovanov")
async def seal_khovanov_route(request: SealKhovanovRequest):
    """Seal categorified knot differential and lock foam cobordism bounds."""
    sh = get_khovanov_foam_shield()
    try:
        return sh.seal_khovanov_homology(
            knot_id=request.knot_id,
            knot_rank=request.knot_rank,
            crossing_depth=request.crossing_depth,
            foam_facets=request.foam_facets,
            khovanov_gain=request.khovanov_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_khovanov_metrics_route():
    """Return aggregate Khovanov Homology & Foam Shield telemetry."""
    sh = get_khovanov_foam_shield()
    return sh.get_khovanov_metrics()
