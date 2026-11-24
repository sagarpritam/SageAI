"""FastAPI Router for Capability 174: Novikov-Shubin Invariants & L^2-Betti Cohomological Barrier."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.novikov_shubin_barrier.novikov_shubin_barrier import (
    get_novikov_shubin_barrier_service,
)

router = APIRouter(
    prefix="/api/novikov-shubin",
    tags=["Capability 174: Novikov-Shubin Barrier"],
)


class ComputeInvariantsRequest(BaseModel):
    covering_id: str = Field(..., description="ID of the infinite Galois covering")
    spectral_order: int = Field(
        default=6, ge=1, le=12, description="Combinatorial Laplacian spectral order"
    )
    dilatational_cutoff: float = Field(
        default=1e-4, ge=1e-8, le=1e-1, description="Dilatational zero-mode cutoff"
    )
    barrier_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="L^2-Betti barrier pinning gain"
    )


@router.get("/coverings")
async def list_galois_coverings():
    """List registered infinite Galois coverings."""
    svc = get_novikov_shubin_barrier_service()
    return {"coverings": svc.get_coverings()}


@router.post("/compute-invariants")
async def compute_novikov_shubin_invariants(request: ComputeInvariantsRequest):
    """Compute Novikov-Shubin spectral capacity and verify Atiyah L^2-index theorem."""
    svc = get_novikov_shubin_barrier_service()
    try:
        return svc.compute_invariants(
            covering_id=request.covering_id,
            spectral_order=request.spectral_order,
            dilatational_cutoff=request.dilatational_cutoff,
            barrier_gain=request.barrier_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_novikov_shubin_metrics():
    """Return operational metrics for Novikov-Shubin barrier."""
    svc = get_novikov_shubin_barrier_service()
    return svc.get_metrics()
