"""
FastAPI Router for Borcherds Automorphic Products, Kac-Moody Vertex Algebras & Monstrous Moonshine Barrier (Capability 198).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.borcherds_kac_moody_moonshine_barrier import (
    get_borcherds_kac_moody_moonshine_barrier_service,
)

router = APIRouter(
    prefix="/api/borcherds-kac-moody-moonshine",
    tags=["Borcherds Kac-Moody Moonshine Barrier"],
)

class EvaluateAutomorphicProductRequest(BaseModel):
    algebra_id: str = Field(..., description="ID of algebra to evaluate")
    central_charge: Optional[int] = Field(24, description="Central charge c")
    q_expansion_order: Optional[int] = Field(4, description="q-expansion order")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")

@router.get("/algebras")
async def list_algebras():
    service = get_borcherds_kac_moody_moonshine_barrier_service()
    return {"algebras": service.list_algebras()}

@router.post("/evaluate-automorphic-product")
async def evaluate_automorphic_product(request: EvaluateAutomorphicProductRequest):
    service = get_borcherds_kac_moody_moonshine_barrier_service()
    try:
        return service.evaluate_automorphic_product(
            algebra_id=request.algebra_id,
            central_charge=request.central_charge or 24,
            q_expansion_order=request.q_expansion_order or 4,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_borcherds_kac_moody_moonshine_barrier_service()
    return service.get_metrics()
