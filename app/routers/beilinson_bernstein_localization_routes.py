"""
FastAPI Router for Beilinson-Bernstein Localization & Flag Variety D-Modules Barrier (Capability 195).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.beilinson_bernstein_localization_barrier import (
    get_beilinson_bernstein_localization_barrier_service,
)

router = APIRouter(
    prefix="/api/beilinson-bernstein-localization",
    tags=["Beilinson-Bernstein Localization Barrier"],
)

class EvaluateDModuleLocalizationRequest(BaseModel):
    variety_id: str = Field(..., description="ID of flag variety to evaluate")
    flag_dimension: Optional[int] = Field(3, description="Dimension of flag variety")
    twisted_lambda: Optional[float] = Field(1.0, description="Twisted character parameter")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")

@router.get("/algebras")
async def list_algebras():
    service = get_beilinson_bernstein_localization_barrier_service()
    return {"algebras": service.list_algebras()}

@router.post("/evaluate-d-module-localization")
async def evaluate_d_module_localization(request: EvaluateDModuleLocalizationRequest):
    service = get_beilinson_bernstein_localization_barrier_service()
    try:
        return service.evaluate_d_module_localization(
            variety_id=request.variety_id,
            flag_dimension=request.flag_dimension or 3,
            twisted_lambda=request.twisted_lambda or 1.0,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_beilinson_bernstein_localization_barrier_service()
    return service.get_metrics()
