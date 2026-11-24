"""FastAPI Router for Capability 172: Non-Commutative Connes Spectral Geometry Armor."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.connes_spectral_geometry.connes_spectral_geometry import (
    get_connes_spectral_geometry_service,
)

router = APIRouter(
    prefix="/api/connes-spectral-geometry",
    tags=["Capability 172: Connes Spectral Armor"],
)


class EvaluateSpectralActionRequest(BaseModel):
    triple_id: str = Field(..., description="ID of the Connes spectral triple")
    energy_cutoff_gev: float = Field(
        default=1e16, ge=1e3, le=1e19, description="Energy cutoff scale Lambda in GeV"
    )
    heat_kernel_order: int = Field(
        default=4, ge=1, le=8, description="Asymptotic heat kernel Seeley-DeWitt order"
    )
    dixmier_trace_scale: float = Field(
        default=1.15, ge=0.5, le=3.0, description="Dixmier trace integration metric scale"
    )
    gauge_coupling_unification: float = Field(
        default=0.98, ge=0.5, le=1.0, description="Grand unification gauge coupling fidelity"
    )


@router.get("/triples")
async def list_spectral_triples():
    """List registered Connes spectral triples."""
    svc = get_connes_spectral_geometry_service()
    return {"triples": svc.get_triples()}


@router.post("/evaluate-action")
async def evaluate_connes_spectral_action(request: EvaluateSpectralActionRequest):
    """Evaluate Connes-Chamseddine spectral action and Dixmier trace."""
    svc = get_connes_spectral_geometry_service()
    try:
        return svc.evaluate_spectral_action(
            triple_id=request.triple_id,
            energy_cutoff_gev=request.energy_cutoff_gev,
            heat_kernel_order=request.heat_kernel_order,
            dixmier_trace_scale=request.dixmier_trace_scale,
            gauge_coupling_unification=request.gauge_coupling_unification,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_connes_metrics():
    """Return operational metrics for Connes spectral geometry armor."""
    svc = get_connes_spectral_geometry_service()
    return svc.get_metrics()
