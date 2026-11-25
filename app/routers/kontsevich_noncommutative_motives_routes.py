"""
FastAPI Router for Kontsevich-Sagalovich Noncommutative Motives & Chern Character Firewall (Capability 199).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.kontsevich_noncommutative_motives_firewall import (
    get_kontsevich_noncommutative_motives_firewall_service,
)

router = APIRouter(
    prefix="/api/kontsevich-noncommutative-motives",
    tags=["Kontsevich Noncommutative Motives Firewall"],
)

class EvaluateNoncommutativeChernRequest(BaseModel):
    motive_id: str = Field(..., description="ID of motive to evaluate")
    categorical_dimension: Optional[int] = Field(3, description="Categorical dimension")
    hochschild_degree: Optional[int] = Field(2, description="Hochschild degree")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")

@router.get("/motives")
async def list_motives():
    service = get_kontsevich_noncommutative_motives_firewall_service()
    return {"motives": service.list_motives()}

@router.post("/evaluate-noncommutative-chern-character")
async def evaluate_noncommutative_chern_character(request: EvaluateNoncommutativeChernRequest):
    service = get_kontsevich_noncommutative_motives_firewall_service()
    try:
        return service.evaluate_noncommutative_chern_character(
            motive_id=request.motive_id,
            categorical_dimension=request.categorical_dimension or 3,
            hochschild_degree=request.hochschild_degree or 2,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_kontsevich_noncommutative_motives_firewall_service()
    return service.get_metrics()
