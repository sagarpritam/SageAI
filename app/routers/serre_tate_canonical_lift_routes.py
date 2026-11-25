"""
FastAPI Router for Serre-Tate Canonical Lift & p-Divisible Group Firewall (Capability 211).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.serre_tate_canonical_lift_firewall import (
    get_serre_tate_canonical_lift_firewall_service,
)

router = APIRouter(
    prefix="/api/serre-tate-canonical-lift",
    tags=["Serre-Tate Canonical Lift Firewall"],
)


class EvaluateCanonicalLiftRequest(BaseModel):
    lift_id: str = Field(..., description="ID of canonical Witt-vector lift")
    prime_p: Optional[int] = Field(5, description="Characteristic prime p")
    abelian_dimension_g: Optional[int] = Field(2, description="Dimension g of abelian variety")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")


@router.get("/lifts")
async def list_lifts():
    service = get_serre_tate_canonical_lift_firewall_service()
    return {"lifts": service.list_lifts()}


@router.post("/evaluate-canonical-lift")
async def evaluate_canonical_lift(request: EvaluateCanonicalLiftRequest):
    service = get_serre_tate_canonical_lift_firewall_service()
    try:
        return service.evaluate_canonical_lift(
            lift_id=request.lift_id,
            prime_p=request.prime_p or 5,
            abelian_dimension_g=request.abelian_dimension_g or 2,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_serre_tate_canonical_lift_firewall_service()
    return service.get_metrics()
