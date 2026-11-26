"""
FastAPI Router for Ihara Galois Braid & Profinite Fundamental Group Shield (Capability 215).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.ihara_galois_braid_profinite_shield import (
    get_ihara_galois_braid_profinite_shield_service,
)

router = APIRouter(
    prefix="/api/ihara-galois-braid",
    tags=["Ihara Galois Braid Shield"],
)


class EvaluateProfiniteBraidRequest(BaseModel):
    braid_id: str = Field(..., description="ID of profinite braid configuration")
    puncture_count: Optional[int] = Field(3, description="Number of punctures on P^1")
    profinite_depth: Optional[int] = Field(4, description="Profinite completion depth")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")


@router.get("/braids")
async def list_braids():
    service = get_ihara_galois_braid_profinite_shield_service()
    return {"braids": service.list_braids()}


@router.post("/evaluate-profinite-braid")
async def evaluate_profinite_braid(request: EvaluateProfiniteBraidRequest):
    service = get_ihara_galois_braid_profinite_shield_service()
    try:
        return service.evaluate_profinite_braid(
            braid_id=request.braid_id,
            puncture_count=request.puncture_count or 3,
            profinite_depth=request.profinite_depth or 4,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_ihara_galois_braid_profinite_shield_service()
    return service.get_metrics()
