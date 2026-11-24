"""
FastAPI Router for Capability 161: Fibonacci Anyon Braiding & Topological Fusion Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.fibonacci_anyon_braiding.fibonacci_anyon_braiding import (
    get_fibonacci_anyon_braiding_service,
)

router = APIRouter(
    prefix="/api/fibonacci-anyon-braiding",
    tags=["Capability 161: Fibonacci Anyon Braiding"],
)


class ExecuteBraidRequest(BaseModel):
    braid_id: str = Field(..., description="ID of the Fibonacci anyon braid system")
    generator_index: int = Field(
        default=2, ge=1, le=16, description="Artin braid generator index sigma_i"
    )
    braid_turns: int = Field(
        default=8,
        ge=1,
        le=128,
        description="Number of complete topological braid exchange turns",
    )
    topological_order_k: int = Field(
        default=5, ge=3, le=32, description="Chern-Simons topological level k"
    )
    braid_gain: float = Field(
        default=1.2, ge=0.5, le=3.0, description="Topological gate amplification gain"
    )


@router.get("/braids")
async def list_fibonacci_braids():
    """List registered Fibonacci anyon braid systems."""
    svc = get_fibonacci_anyon_braiding_service()
    return {"braids": svc.get_braids()}


@router.post("/execute-braid")
async def execute_fibonacci_braid(request: ExecuteBraidRequest):
    """Execute a fault-tolerant topological braid operation on Fibonacci anyons."""
    svc = get_fibonacci_anyon_braiding_service()
    try:
        return svc.execute_braid(
            braid_id=request.braid_id,
            generator_index=request.generator_index,
            braid_turns=request.braid_turns,
            topological_order_k=request.topological_order_k,
            braid_gain=request.braid_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_fibonacci_braiding_metrics():
    """Return aggregate telemetry metrics for Fibonacci anyon braiding."""
    svc = get_fibonacci_anyon_braiding_service()
    return svc.get_metrics()
