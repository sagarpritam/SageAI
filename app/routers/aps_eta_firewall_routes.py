"""FastAPI Router for Capability 175: Atiyah-Patodi-Singer Spectral Asymmetry eta-Invariant Firewall."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.aps_eta_invariant_firewall.aps_eta_invariant_firewall import (
    get_aps_eta_invariant_firewall_service,
)

router = APIRouter(
    prefix="/api/aps-eta-firewall",
    tags=["Capability 175: APS Eta Firewall"],
)


class EvaluateEtaRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the APS boundary manifold")
    spectral_s: float = Field(
        default=0.0, ge=-2.0, le=2.0, description="Complex spectral parameter s for eta(s)"
    )
    eigenvalue_cutoff: int = Field(
        default=50, ge=10, le=200, description="Boundary Dirac eigenvalue truncation cutoff"
    )
    boundary_damping: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Non-local spectral boundary damping gain"
    )


@router.get("/manifolds")
async def list_aps_manifolds():
    """List registered APS boundary manifolds."""
    svc = get_aps_eta_invariant_firewall_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/evaluate-eta")
async def evaluate_aps_eta_invariant(request: EvaluateEtaRequest):
    """Evaluate APS spectral asymmetry eta invariant and seal boundary anomaly."""
    svc = get_aps_eta_invariant_firewall_service()
    try:
        return svc.evaluate_eta_invariant(
            manifold_id=request.manifold_id,
            spectral_s=request.spectral_s,
            eigenvalue_cutoff=request.eigenvalue_cutoff,
            boundary_damping=request.boundary_damping,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_aps_eta_metrics():
    """Return operational metrics for APS eta-invariant firewall."""
    svc = get_aps_eta_invariant_firewall_service()
    return svc.get_metrics()
