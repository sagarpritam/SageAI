"""
FastAPI Router for Fargues-Fontaine Curve & Vector Bundles Classification Shield (Capability 200 - Bicentennial Milestone).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.fargues_fontaine_curve_shield import (
    get_fargues_fontaine_curve_shield_service,
)

router = APIRouter(
    prefix="/api/fargues-fontaine-curve",
    tags=["Fargues-Fontaine Curve Shield"],
)

class EvaluateVectorBundleSlopeRequest(BaseModel):
    bundle_id: str = Field(..., description="ID of vector bundle to evaluate")
    bundle_rank: Optional[int] = Field(2, description="Rank of bundle E")
    bundle_degree: Optional[int] = Field(0, description="Degree of bundle E")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")

@router.get("/bundles")
async def list_bundles():
    service = get_fargues_fontaine_curve_shield_service()
    return {"bundles": service.list_bundles()}

@router.post("/evaluate-vector-bundle-slope")
async def evaluate_vector_bundle_slope(request: EvaluateVectorBundleSlopeRequest):
    service = get_fargues_fontaine_curve_shield_service()
    try:
        return service.evaluate_vector_bundle_slope(
            bundle_id=request.bundle_id,
            bundle_rank=request.bundle_rank or 2,
            bundle_degree=request.bundle_degree if request.bundle_degree is not None else 0,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_fargues_fontaine_curve_shield_service()
    return service.get_metrics()
