"""
FastAPI Router for Tate-Shafarevich Group & Selmer Descent Shield (Capability 212).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.tate_shafarevich_selmer_descent_shield import (
    get_tate_shafarevich_selmer_descent_shield_service,
)

router = APIRouter(
    prefix="/api/tate-shafarevich-selmer",
    tags=["Tate-Shafarevich Selmer Shield"],
)


class EvaluateSelmerDescentRequest(BaseModel):
    curve_id: str = Field(..., description="ID of elliptic curve to evaluate")
    selmer_rank: Optional[int] = Field(1, description="p-Selmer group rank")
    sha_order: Optional[int] = Field(1, description="Order of Tate-Shafarevich group")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")


@router.get("/curves")
async def list_curves():
    service = get_tate_shafarevich_selmer_descent_shield_service()
    return {"curves": service.list_curves()}


@router.post("/evaluate-selmer-descent")
async def evaluate_selmer_descent(request: EvaluateSelmerDescentRequest):
    service = get_tate_shafarevich_selmer_descent_shield_service()
    try:
        return service.evaluate_selmer_descent(
            curve_id=request.curve_id,
            selmer_rank=request.selmer_rank or 1,
            sha_order=request.sha_order or 1,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_tate_shafarevich_selmer_descent_shield_service()
    return service.get_metrics()
