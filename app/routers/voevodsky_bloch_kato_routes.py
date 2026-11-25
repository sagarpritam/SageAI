"""
FastAPI Router for Voevodsky Motivic Spectral Sequence & Bloch-Kato Norm Residue Barrier (Capability 201).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.voevodsky_bloch_kato_barrier import (
    get_voevodsky_bloch_kato_barrier_service,
)

router = APIRouter(
    prefix="/api/voevodsky-bloch-kato",
    tags=["Voevodsky Bloch-Kato Barrier"],
)

class EvaluateNormResidueRequest(BaseModel):
    complex_id: str = Field(..., description="ID of motivic complex to evaluate")
    prime_l: Optional[int] = Field(2, description="Galois torsion prime l")
    weight_n: Optional[int] = Field(3, description="Motivic weight n")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")

@router.get("/complexes")
async def list_complexes():
    service = get_voevodsky_bloch_kato_barrier_service()
    return {"complexes": service.list_complexes()}

@router.post("/evaluate-norm-residue-isomorphism")
async def evaluate_norm_residue_isomorphism(request: EvaluateNormResidueRequest):
    service = get_voevodsky_bloch_kato_barrier_service()
    try:
        return service.evaluate_norm_residue_isomorphism(
            complex_id=request.complex_id,
            prime_l=request.prime_l or 2,
            weight_n=request.weight_n or 3,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_voevodsky_bloch_kato_barrier_service()
    return service.get_metrics()
