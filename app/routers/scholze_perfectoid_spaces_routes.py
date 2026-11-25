"""
FastAPI Router for Scholze Perfectoid Spaces, Tilting Equivalence & Almost Purity Shield (Capability 197).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.scholze_perfectoid_spaces_shield import (
    get_scholze_perfectoid_spaces_shield_service,
)

router = APIRouter(
    prefix="/api/scholze-perfectoid-spaces",
    tags=["Scholze Perfectoid Spaces Shield"],
)

class EvaluateTiltingEquivalenceRequest(BaseModel):
    space_id: str = Field(..., description="ID of space to evaluate")
    prime_p: Optional[int] = Field(5, description="p-adic prime parameter")
    tilt_precision: Optional[int] = Field(4, description="Tilting precision degree")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")

@router.get("/spaces")
async def list_spaces():
    service = get_scholze_perfectoid_spaces_shield_service()
    return {"spaces": service.list_spaces()}

@router.post("/evaluate-tilting-equivalence")
async def evaluate_tilting_equivalence(request: EvaluateTiltingEquivalenceRequest):
    service = get_scholze_perfectoid_spaces_shield_service()
    try:
        return service.evaluate_tilting_equivalence(
            space_id=request.space_id,
            prime_p=request.prime_p or 5,
            tilt_precision=request.tilt_precision or 4,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_scholze_perfectoid_spaces_shield_service()
    return service.get_metrics()
