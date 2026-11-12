"""
FastAPI Router for Capability 142: PTVV Derived Shifted-Symplectic Stack & AKSZ Lagrangian Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.derived_shifted_symplectic.derived_shifted_symplectic import (
    get_derived_shifted_symplectic_shield,
)

router = APIRouter(
    prefix="/api/derived-shifted-symplectic",
    tags=["Capability 142: PTVV Derived Shifted-Symplectic Shield"],
)


class SealLagrangianRequest(BaseModel):
    stack_id: str = Field(..., description="ID of the derived shifted-symplectic stack")
    symplectic_shift_n: int = Field(
        default=-1, ge=-4, le=4, description="Derived symplectic form shift degree n"
    )
    lagrangian_intersection_rank: int = Field(
        default=10, ge=2, le=64, description="Derived Lagrangian intersection rank"
    )
    aksz_transgression_degree: int = Field(
        default=6, ge=2, le=32, description="AKSZ mapping stack transgression degree"
    )
    symplectic_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="PTVV symplectic sealing gain"
    )


@router.get("/stacks")
async def list_symplectic_stacks():
    """List registered derived shifted-symplectic stacks."""
    shield = get_derived_shifted_symplectic_shield()
    return {"stacks": shield.get_stacks()}


@router.post("/seal-lagrangian")
async def seal_lagrangian_route(request: SealLagrangianRequest):
    """Seal derived shifted-symplectic forms and AKSZ Lagrangian intersections."""
    shield = get_derived_shifted_symplectic_shield()
    try:
        return shield.seal_derived_lagrangian(
            stack_id=request.stack_id,
            symplectic_shift_n=request.symplectic_shift_n,
            lagrangian_intersection_rank=request.lagrangian_intersection_rank,
            aksz_transgression_degree=request.aksz_transgression_degree,
            symplectic_gain=request.symplectic_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_symplectic_metrics():
    """Retrieve aggregate PTVV Derived Shifted-Symplectic Shield metrics."""
    shield = get_derived_shifted_symplectic_shield()
    return shield.get_symplectic_metrics()
