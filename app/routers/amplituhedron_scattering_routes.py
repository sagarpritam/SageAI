"""
FastAPI Router for Capability 110: Amplituhedron Positive-Geometry Scattering Matrix Optimizer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.amplituhedron_scattering.amplituhedron_scattering import (
    get_amplituhedron_scattering_optimizer,
)

router = APIRouter(
    prefix="/api/amplituhedron-scattering",
    tags=["Capability 110: Amplituhedron Positive-Geometry Scattering"],
)


class OptimizeCanonicalFormRequest(BaseModel):
    geometry_id: str = Field(
        ..., description="ID of the Amplituhedron positive-geometry polytope"
    )
    particle_legs_n: int = Field(
        default=8,
        ge=4,
        le=14,
        description="External massless gluon leg count n",
    )
    mhv_sector_k: int = Field(
        default=3,
        ge=2,
        le=6,
        description="Grassmannian G_+(k, n) helicity sector k",
    )
    loop_order_l: int = Field(
        default=2,
        ge=0,
        le=6,
        description="Planar loop integrand order L",
    )
    positivity_gain: float = Field(
        default=1.15,
        ge=0.8,
        le=2.5,
        description="BCFW positive-cell minor stabilization gain",
    )


@router.get("/geometries")
async def list_geometries():
    """List all registered Amplituhedron positive-geometry polytopes."""
    optimizer = get_amplituhedron_scattering_optimizer()
    return {"geometries": optimizer.get_geometries()}


@router.post("/optimize-form")
async def optimize_form_route(request: OptimizeCanonicalFormRequest):
    """Evaluate canonical form Omega(Y; Z) over positive Grassmannian cells."""
    optimizer = get_amplituhedron_scattering_optimizer()
    try:
        return optimizer.optimize_canonical_form(
            geometry_id=request.geometry_id,
            particle_legs_n=request.particle_legs_n,
            mhv_sector_k=request.mhv_sector_k,
            loop_order_l=request.loop_order_l,
            positivity_gain=request.positivity_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_amplituhedron_metrics():
    """Retrieve aggregate Amplituhedron positive-geometry scattering metrics."""
    optimizer = get_amplituhedron_scattering_optimizer()
    return optimizer.get_amplituhedron_metrics()
