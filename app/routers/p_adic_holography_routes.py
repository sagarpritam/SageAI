"""
FastAPI Router for Capability 136: p-Adic Bruhat-Tits Tree AdS/CFT & Ultrametric Berkovich Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.adic_p_adic_holography.adic_p_adic_holography import (
    get_p_adic_holography_shield,
)

router = APIRouter(
    prefix="/api/adic-p-adic-holography",
    tags=["Capability 136: p-Adic Bruhat-Tits Holography Ultrametric Shield"],
)


class SealUltrametricTreeRequest(BaseModel):
    tree_id: str = Field(
        ..., description="ID of the p-Adic Bruhat-Tits holographic tree"
    )
    prime_base_p: int = Field(
        default=3,
        ge=2,
        le=97,
        description="Non-Archimedean p-adic prime base p",
    )
    tree_depth_n: int = Field(
        default=12,
        ge=4,
        le=64,
        description="Bruhat-Tits radial geodesic depth n",
    )
    vladimirov_order: float = Field(
        default=2.0,
        ge=0.5,
        le=12.0,
        description="Vladimirov fractional derivative order s",
    )
    ultrametric_gain: float = Field(
        default=1.5,
        ge=0.85,
        le=2.5,
        description="Ultrametric strong-triangle clamping gain",
    )


@router.get("/trees")
async def list_trees():
    """List registered p-Adic Bruhat-Tits holographic trees."""
    shield = get_p_adic_holography_shield()
    return {"trees": shield.get_trees()}


@router.post("/seal-ultrametric")
async def seal_ultrametric_route(request: SealUltrametricTreeRequest):
    """Seal ultrametric bulk-to-boundary propagators and clamp Archimedean leakage."""
    shield = get_p_adic_holography_shield()
    try:
        return shield.seal_ultrametric_tree(
            tree_id=request.tree_id,
            prime_base_p=request.prime_base_p,
            tree_depth_n=request.tree_depth_n,
            vladimirov_order=request.vladimirov_order,
            ultrametric_gain=request.ultrametric_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_p_adic_metrics():
    """Retrieve aggregate p-Adic Bruhat-Tits Holography Shield telemetry."""
    shield = get_p_adic_holography_shield()
    return shield.get_p_adic_metrics()
