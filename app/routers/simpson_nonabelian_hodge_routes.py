"""
FastAPI router for Capability 185: Simpson Nonabelian Hodge Correspondence & Higgs Bundles Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.simpson_nonabelian_hodge_shield import (
    get_simpson_nonabelian_hodge_shield_service,
)

router = APIRouter(
    prefix="/api/simpson-nonabelian-hodge",
    tags=["Simpson Nonabelian Hodge Shield"],
)


class SolveHitchinSimpsonRequest(BaseModel):
    bundle_id: str = Field(..., description="ID of the Higgs bundle configuration")
    harmonic_damping: float = Field(
        default=0.05, ge=1e-4, le=1.0, description="Harmonic metric gradient damping"
    )
    spectral_cutoff: int = Field(
        default=4, ge=1, le=16, description="Spectral curve Hitchin fibration cutoff"
    )
    hodge_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Nonabelian Hodge correspondence gain"
    )


@router.get("/bundles")
async def list_higgs_bundles():
    """List registered Higgs bundle configurations and flat connections."""
    svc = get_simpson_nonabelian_hodge_shield_service()
    return {"bundles": svc.get_bundles()}


@router.post("/solve-hitchin-simpson")
async def solve_hitchin_simpson(request: SolveHitchinSimpsonRequest):
    """Solve Hitchin-Simpson harmonic metric equation and enforce nonabelian Hodge correspondence."""
    svc = get_simpson_nonabelian_hodge_shield_service()
    try:
        return svc.solve_hitchin_simpson(
            bundle_id=request.bundle_id,
            harmonic_damping=request.harmonic_damping,
            spectral_cutoff=request.spectral_cutoff,
            hodge_gain=request.hodge_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_hodge_shield_metrics():
    """Get operational telemetry metrics for Simpson nonabelian Hodge shield."""
    svc = get_simpson_nonabelian_hodge_shield_service()
    return svc.get_metrics()
