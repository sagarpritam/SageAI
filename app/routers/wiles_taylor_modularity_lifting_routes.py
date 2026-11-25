"""
FastAPI Router for Wiles-Taylor Modularity Lifting Barrier (Capability 204).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.wiles_taylor_modularity_lifting_barrier import (
    get_wiles_taylor_modularity_lifting_barrier_service,
)

router = APIRouter(
    prefix="/api/wiles-taylor-modularity-lifting",
    tags=["Wiles-Taylor Modularity Lifting Barrier"],
)


class EvaluateModularityLiftingRequest(BaseModel):
    ring_id: str = Field(..., description="ID of Galois deformation ring to evaluate")
    conductor_n: Optional[int] = Field(11, description="Conductor N of elliptic curve")
    residue_prime: Optional[int] = Field(3, description="Residual Galois prime p")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")


@router.get("/rings")
async def list_rings():
    service = get_wiles_taylor_modularity_lifting_barrier_service()
    return {"rings": service.list_rings()}


@router.post("/evaluate-modularity-lifting")
async def evaluate_modularity_lifting(request: EvaluateModularityLiftingRequest):
    service = get_wiles_taylor_modularity_lifting_barrier_service()
    try:
        return service.evaluate_modularity_lifting(
            ring_id=request.ring_id,
            conductor_n=request.conductor_n or 11,
            residue_prime=request.residue_prime or 3,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_wiles_taylor_modularity_lifting_barrier_service()
    return service.get_metrics()
