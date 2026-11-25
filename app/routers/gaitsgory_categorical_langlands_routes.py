"""
FastAPI Router for Gaitsgory Categorical Geometric Langlands Shield (Capability 203).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.gaitsgory_categorical_langlands_shield import (
    get_gaitsgory_categorical_langlands_shield_service,
)

router = APIRouter(
    prefix="/api/gaitsgory-categorical-langlands",
    tags=["Gaitsgory Categorical Langlands Shield"],
)


class EvaluateCategoricalEquivalenceRequest(BaseModel):
    functor_id: str = Field(..., description="ID of Langlands functor to evaluate")
    dual_rank: Optional[int] = Field(2, description="Rank of Langlands dual group G_check")
    nilpotent_orbit_dim: Optional[int] = Field(4, description="Dimension of nilpotent singular support")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")


@router.get("/functors")
async def list_functors():
    service = get_gaitsgory_categorical_langlands_shield_service()
    return {"functors": service.list_functors()}


@router.post("/evaluate-categorical-equivalence")
async def evaluate_categorical_equivalence(request: EvaluateCategoricalEquivalenceRequest):
    service = get_gaitsgory_categorical_langlands_shield_service()
    try:
        return service.evaluate_categorical_equivalence(
            functor_id=request.functor_id,
            dual_rank=request.dual_rank or 2,
            nilpotent_orbit_dim=request.nilpotent_orbit_dim if request.nilpotent_orbit_dim is not None else 4,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_gaitsgory_categorical_langlands_shield_service()
    return service.get_metrics()
