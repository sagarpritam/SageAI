"""FastAPI Router for Capability 173: Kontsevich Deformation Quantization Shield."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.kontsevich_deformation_shield.kontsevich_deformation_shield import (
    get_kontsevich_deformation_shield_service,
)

router = APIRouter(
    prefix="/api/kontsevich-deformation",
    tags=["Capability 173: Kontsevich Deformation Shield"],
)


class QuantizeDeformationRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the Poisson manifold")
    hbar_order: int = Field(
        default=4, ge=1, le=10, description="Perturbative expansion order in hbar"
    )
    harmonic_precision: float = Field(
        default=1e-6, ge=1e-12, le=1e-2, description="Harmonic propagator integration precision"
    )
    deformation_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Non-commutative deformation pinning gain"
    )


@router.get("/manifolds")
async def list_poisson_manifolds():
    """List registered Poisson manifolds."""
    svc = get_kontsevich_deformation_shield_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/quantize-deformation")
async def quantize_poisson_deformation(request: QuantizeDeformationRequest):
    """Quantize Poisson structure via Kontsevich formality graphs and star-product."""
    svc = get_kontsevich_deformation_shield_service()
    try:
        return svc.quantize_deformation(
            manifold_id=request.manifold_id,
            hbar_order=request.hbar_order,
            harmonic_precision=request.harmonic_precision,
            deformation_gain=request.deformation_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_kontsevich_metrics():
    """Return operational metrics for Kontsevich deformation shield."""
    svc = get_kontsevich_deformation_shield_service()
    return svc.get_metrics()
