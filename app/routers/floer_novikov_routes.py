"""
FastAPI Router for Capability 156: Floer-Novikov Homology & Morse-Smale Gradient Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.floer_novikov_gradient.floer_novikov_gradient import (
    get_floer_novikov_firewall,
)

router = APIRouter(
    prefix="/api/floer-novikov-gradient",
    tags=["Capability 156: Floer-Novikov Gradient Firewall"],
)


class SealFloerNovikovRequest(BaseModel):
    manifold_id: str = Field(
        ..., description="ID of the Floer-Novikov critical manifold"
    )
    critical_point_rank: int = Field(
        default=4, ge=2, le=16, description="Morse-Novikov critical points rank"
    )
    gradient_flow_lines: int = Field(
        default=12,
        ge=4,
        le=64,
        description="Morse-Smale gradient trajectory flow count",
    )
    novikov_filtration_depth: int = Field(
        default=6, ge=2, le=32, description="Universal Novikov field filtration depth"
    )
    novikov_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Lagrangian intersection Floer gain multiplier",
    )


@router.get("/critical-manifolds")
async def list_novikov_manifolds():
    """List registered Floer-Novikov critical manifolds."""
    fw = get_floer_novikov_firewall()
    return {"critical_manifolds": fw.get_manifolds()}


@router.post("/seal-novikov")
async def seal_novikov_route(request: SealFloerNovikovRequest):
    """Seal Novikov monodromy holonomy and lock Morse-Smale gradient energy bounds."""
    fw = get_floer_novikov_firewall()
    try:
        return fw.seal_floer_novikov(
            manifold_id=request.manifold_id,
            critical_point_rank=request.critical_point_rank,
            gradient_flow_lines=request.gradient_flow_lines,
            novikov_filtration_depth=request.novikov_filtration_depth,
            novikov_gain=request.novikov_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_novikov_metrics_route():
    """Return aggregate Floer-Novikov Firewall telemetry."""
    fw = get_floer_novikov_firewall()
    return fw.get_novikov_metrics()
