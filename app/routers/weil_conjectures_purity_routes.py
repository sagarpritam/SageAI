"""
FastAPI Router for Weil Conjectures & Deligne Frobenius Purity Barrier (Capability 207).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.weil_conjectures_frobenius_purity_barrier import (
    get_weil_conjectures_frobenius_purity_barrier_service,
)

router = APIRouter(
    prefix="/api/weil-conjectures-purity",
    tags=["Weil Conjectures Frobenius Purity Barrier"],
)


class EvaluateFrobeniusPurityRequest(BaseModel):
    variety_id: str = Field(..., description="ID of algebraic variety over F_q")
    finite_field_q: Optional[int] = Field(7, description="Cardinality q of finite field F_q")
    cohomology_weight_w: Optional[int] = Field(1, description="Weight w of etale cohomology")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")


@router.get("/varieties")
async def list_varieties():
    service = get_weil_conjectures_frobenius_purity_barrier_service()
    return {"varieties": service.list_varieties()}


@router.post("/evaluate-frobenius-purity")
async def evaluate_frobenius_purity(request: EvaluateFrobeniusPurityRequest):
    service = get_weil_conjectures_frobenius_purity_barrier_service()
    try:
        return service.evaluate_frobenius_purity(
            variety_id=request.variety_id,
            finite_field_q=request.finite_field_q or 7,
            cohomology_weight_w=request.cohomology_weight_w if request.cohomology_weight_w is not None else 1,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_weil_conjectures_frobenius_purity_barrier_service()
    return service.get_metrics()
