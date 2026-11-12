"""
FastAPI Router for Capability 141: Clausen-Scholze Condensed Mathematics & Liquid Vector Space Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.condensed_liquid_mathematics.condensed_liquid_mathematics import (
    get_condensed_liquid_shield,
)

router = APIRouter(
    prefix="/api/condensed-liquid-mathematics",
    tags=["Capability 141: Condensed Mathematics & Liquid Shield"],
)


class SealCondensedRequest(BaseModel):
    module_id: str = Field(..., description="ID of the condensed liquid vector module")
    liquid_exponent_p: float = Field(
        default=0.5, ge=0.1, le=1.0, description="Scholze liquid p-norm exponent"
    )
    profinite_stone_rank: int = Field(
        default=16, ge=4, le=128, description="Profinite Stone-space tower rank"
    )
    ext_vanishing_degree: int = Field(
        default=6, ge=2, le=32, description="Ext^i acyclicity vanishing threshold"
    )
    condensed_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Liquid solidification gain"
    )


@router.get("/modules")
async def list_condensed_modules():
    """List registered condensed liquid vector modules."""
    shield = get_condensed_liquid_shield()
    return {"modules": shield.get_modules()}


@router.post("/seal-condensed")
async def seal_condensed_route(request: SealCondensedRequest):
    """Seal profinite Stone condensations and Scholze liquid analytic spaces."""
    shield = get_condensed_liquid_shield()
    try:
        return shield.seal_condensed_module(
            module_id=request.module_id,
            liquid_exponent_p=request.liquid_exponent_p,
            profinite_stone_rank=request.profinite_stone_rank,
            ext_vanishing_degree=request.ext_vanishing_degree,
            condensed_gain=request.condensed_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_condensed_metrics():
    """Retrieve aggregate Condensed Mathematics & Liquid Shield metrics."""
    shield = get_condensed_liquid_shield()
    return shield.get_condensed_metrics()
