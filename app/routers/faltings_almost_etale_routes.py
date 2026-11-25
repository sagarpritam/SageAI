"""
FastAPI Router for Faltings Almost Étale Extensions & Fontaine Period Ring Shield (Capability 194).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.faltings_almost_etale_shield import (
    get_faltings_almost_etale_shield_service,
)

router = APIRouter(
    prefix="/api/faltings-almost-etale",
    tags=["Faltings Almost Étale Shield"],
)

class EvaluateAlmostEtaleRequest(BaseModel):
    scheme_id: str = Field(..., description="ID of scheme to evaluate")
    p_prime: Optional[int] = Field(5, description="p-adic prime parameter")
    truncation_degree: Optional[int] = Field(4, description="Almost étale truncation degree")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")

@router.get("/schemes")
async def list_schemes():
    service = get_faltings_almost_etale_shield_service()
    return {"schemes": service.list_schemes()}

@router.post("/evaluate-almost-etale-descent")
async def evaluate_almost_etale_descent(request: EvaluateAlmostEtaleRequest):
    service = get_faltings_almost_etale_shield_service()
    try:
        return service.evaluate_almost_etale_descent(
            scheme_id=request.scheme_id,
            p_prime=request.p_prime or 5,
            truncation_degree=request.truncation_degree or 4,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_faltings_almost_etale_shield_service()
    return service.get_metrics()
