"""
FastAPI Router for Option B Wave 31: Sovereign Alcubierre-Lentz Solitonic Warp-Field Transit Matrix.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.alcubierre_lentz_warp.alcubierre_lentz_warp import (
    get_alcubierre_lentz_warp_matrix,
)

router = APIRouter(
    prefix="/api/alcubierre-lentz-warp",
    tags=["Option B Wave 31: Alcubierre-Lentz Solitonic Warp-Field Transit Matrix"],
)


class EngageSolitonRequest(BaseModel):
    corridor_id: str = Field(
        ..., description="ID of the positive-energy Lentz soliton warp corridor"
    )
    target_velocity_c: float = Field(
        default=0.28,
        ge=0.05,
        le=0.48,
        description="Relativistic cruise fraction beta = v / c",
    )
    soliton_radius_m: float = Field(
        default=45.0,
        ge=15.0,
        le=120.0,
        description="Hyperbolic soliton passenger bubble radius in meters",
    )
    positive_plasma_recovery_gain: float = Field(
        default=1.15,
        ge=0.85,
        le=1.5,
        description="Positive-energy plasma shell regenerative confinement gain",
    )


@router.get("/corridors")
async def list_corridors():
    """List all registered Alcubierre-Lentz positive-energy soliton corridors."""
    matrix = get_alcubierre_lentz_warp_matrix()
    return {"corridors": matrix.get_corridors()}


@router.post("/engage-soliton")
async def engage_soliton_route(request: EngageSolitonRequest):
    """Synthesize positive-energy Lentz soliton warp bubble with zero negative mass."""
    matrix = get_alcubierre_lentz_warp_matrix()
    try:
        return matrix.engage_soliton_transit(
            corridor_id=request.corridor_id,
            target_velocity_c=request.target_velocity_c,
            soliton_radius_m=request.soliton_radius_m,
            positive_plasma_recovery_gain=request.positive_plasma_recovery_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_warp_metrics():
    """Retrieve aggregate Alcubierre-Lentz Solitonic Warp-Field metrics."""
    matrix = get_alcubierre_lentz_warp_matrix()
    return matrix.get_warp_metrics()

