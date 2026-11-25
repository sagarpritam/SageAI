"""
FastAPI Router for Grothendieck Standard Conjectures & Lefschetz Motive Shield (Capability 209).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.grothendieck_standard_conjectures_lefschetz_shield import (
    get_grothendieck_standard_conjectures_lefschetz_shield_service,
)

router = APIRouter(
    prefix="/api/grothendieck-standard-conjectures",
    tags=["Grothendieck Standard Conjectures Shield"],
)


class EvaluateStandardConjecturesRequest(BaseModel):
    motive_id: str = Field(..., description="ID of Chow motive to evaluate")
    cycle_codimension: Optional[int] = Field(1, description="Codimension of algebraic cycle")
    lefschetz_degree: Optional[int] = Field(2, description="Hard Lefschetz degree")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")


@router.get("/motives")
async def list_motives():
    service = get_grothendieck_standard_conjectures_lefschetz_shield_service()
    return {"motives": service.list_motives()}


@router.post("/evaluate-standard-conjectures")
async def evaluate_standard_conjectures(request: EvaluateStandardConjecturesRequest):
    service = get_grothendieck_standard_conjectures_lefschetz_shield_service()
    try:
        return service.evaluate_standard_conjectures(
            motive_id=request.motive_id,
            cycle_codimension=request.cycle_codimension or 1,
            lefschetz_degree=request.lefschetz_degree or 2,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_grothendieck_standard_conjectures_lefschetz_shield_service()
    return service.get_metrics()
