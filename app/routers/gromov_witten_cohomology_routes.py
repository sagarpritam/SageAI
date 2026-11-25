"""FastAPI Router for Capability 177: Gromov-Witten Invariants & Quantum Cohomology Barrier."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.gromov_witten_cohomology_barrier.gromov_witten_cohomology_barrier import (
    get_gromov_witten_cohomology_barrier_service,
)

router = APIRouter(
    prefix="/api/gromov-witten-cohomology",
    tags=["Capability 177: Gromov-Witten Cohomology Barrier"],
)


class ComputeQuantumProductRequest(BaseModel):
    target_id: str = Field(..., description="ID of the symplectic target")
    quantum_degree: int = Field(
        default=3, ge=1, le=10, description="Maximal pseudoholomorphic curve degree"
    )
    novikov_parameter_q: float = Field(
        default=0.05, ge=1e-4, le=1.0, description="Novikov ring formal variable q"
    )
    deformation_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Quantum cohomology ring deformation gain"
    )


@router.get("/targets")
async def list_symplectic_targets():
    """List registered symplectic targets."""
    svc = get_gromov_witten_cohomology_barrier_service()
    return {"targets": svc.get_targets()}


@router.post("/compute-quantum-product")
async def compute_quantum_product(request: ComputeQuantumProductRequest):
    """Compute quantum cup product and verify WDVV equations."""
    svc = get_gromov_witten_cohomology_barrier_service()
    try:
        return svc.compute_quantum_product(
            target_id=request.target_id,
            quantum_degree=request.quantum_degree,
            novikov_parameter_q=request.novikov_parameter_q,
            deformation_gain=request.deformation_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_gromov_witten_metrics():
    """Return operational metrics for Gromov-Witten cohomology barrier."""
    svc = get_gromov_witten_cohomology_barrier_service()
    return svc.get_metrics()
