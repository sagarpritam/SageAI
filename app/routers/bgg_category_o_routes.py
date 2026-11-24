"""
FastAPI Router for Capability 162: BGG Category O Shield & Verma Module Invariants.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.bgg_category_o_shield.bgg_category_o_shield import (
    get_bgg_category_o_shield_service,
)

router = APIRouter(
    prefix="/api/bgg-category-o-shield",
    tags=["Capability 162: BGG Category O Shield"],
)


class SealVermaRequest(BaseModel):
    module_id: str = Field(..., description="ID of the Category O Verma module")
    weyl_length: int = Field(
        default=4, ge=1, le=16, description="Length of Weyl group element ell(w)"
    )
    polynomial_deg_q: int = Field(
        default=2, ge=0, le=8, description="Kazhdan-Lusztig polynomial degree in q"
    )
    filtration_steps: int = Field(
        default=8, ge=1, le=32, description="Loewy length filtration refinement steps"
    )
    kl_amplification: float = Field(
        default=1.0,
        ge=0.5,
        le=3.0,
        description="Representation-theoretic amplification factor",
    )


@router.get("/modules")
async def list_category_o_modules():
    """List registered Category O Verma modules."""
    svc = get_bgg_category_o_shield_service()
    return {"modules": svc.get_modules()}


@router.post("/seal-verma")
async def seal_category_o_verma(request: SealVermaRequest):
    """Seal Verma module filtration and evaluate Kazhdan-Lusztig polynomial barrier."""
    svc = get_bgg_category_o_shield_service()
    try:
        return svc.seal_verma(
            module_id=request.module_id,
            weyl_length=request.weyl_length,
            polynomial_deg_q=request.polynomial_deg_q,
            filtration_steps=request.filtration_steps,
            kl_amplification=request.kl_amplification,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_category_o_metrics():
    """Return aggregate telemetry metrics for BGG Category O shield."""
    svc = get_bgg_category_o_shield_service()
    return svc.get_metrics()
