"""
FastAPI router for Capability 184: Atiyah-Segal Axiomatic Functorial TQFT Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.atiyah_segal_tqft_functor_firewall import (
    get_atiyah_segal_tqft_functor_firewall_service,
)

router = APIRouter(
    prefix="/api/atiyah-segal-tqft",
    tags=["Atiyah-Segal TQFT Firewall"],
)


class EvaluateFunctorRequest(BaseModel):
    bordism_id: str = Field(..., description="ID of the bordism category configuration")
    gluing_cut_count: int = Field(
        default=2, ge=1, le=8, description="Number of cutting-and-gluing cobordism slices"
    )
    mapping_class_order: int = Field(
        default=12, ge=1, le=48, description="Mapping class group Mod(g, n) representation order"
    )
    functor_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Symmetric monoidal functorial gain"
    )


@router.get("/bordisms")
async def list_bordism_configurations():
    """List registered bordism category configurations."""
    svc = get_atiyah_segal_tqft_functor_firewall_service()
    return {"bordisms": svc.get_bordisms()}


@router.post("/evaluate-functor")
async def evaluate_functor(request: EvaluateFunctorRequest):
    """Evaluate Atiyah-Segal TQFT functor assignment and verify cobordism gluing."""
    svc = get_atiyah_segal_tqft_functor_firewall_service()
    try:
        return svc.evaluate_functor(
            bordism_id=request.bordism_id,
            gluing_cut_count=request.gluing_cut_count,
            mapping_class_order=request.mapping_class_order,
            functor_gain=request.functor_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_tqft_firewall_metrics():
    """Get operational telemetry metrics for Atiyah-Segal TQFT firewall."""
    svc = get_atiyah_segal_tqft_functor_firewall_service()
    return svc.get_metrics()
