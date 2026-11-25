"""
FastAPI router for Capability 188: Jacob Lurie Higher Topos Theory, Infinity-Categories & Spectral Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.lurie_higher_topos_spectral_shield import (
    get_lurie_higher_topos_spectral_shield_service,
)

router = APIRouter(
    prefix="/api/lurie-higher-topos-spectral",
    tags=["Lurie Higher Topos Spectral Shield"],
)


class EvaluateSpectralDescentRequest(BaseModel):
    topos_id: str = Field(..., description="ID of the infinity-topos configuration")
    truncation_level: int = Field(
        default=4, ge=1, le=16, description="Postnikov tower truncation level"
    )
    e_infinity_order: int = Field(
        default=8, ge=1, le=32, description="E-infinity ring spectrum order"
    )
    shield_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Spectral sheaf descent shield gain"
    )


@router.get("/topoi")
async def list_infinity_topoi():
    """List registered infinity-topoi and spectral scheme configurations."""
    svc = get_lurie_higher_topos_spectral_shield_service()
    return {"topoi": svc.get_topoi()}


@router.post("/evaluate-spectral-descent")
async def evaluate_spectral_descent(request: EvaluateSpectralDescentRequest):
    """Evaluate spectral sheaf descent and enforce hypercomplete higher topos stability."""
    svc = get_lurie_higher_topos_spectral_shield_service()
    try:
        return svc.evaluate_spectral_descent(
            topos_id=request.topos_id,
            truncation_level=request.truncation_level,
            e_infinity_order=request.e_infinity_order,
            shield_gain=request.shield_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_spectral_shield_metrics():
    """Get operational telemetry metrics for Lurie higher topos spectral shield."""
    svc = get_lurie_higher_topos_spectral_shield_service()
    return svc.get_metrics()
