"""
FastAPI Router for Donaldson 4-Manifold Invariants, Gauge Theory & Instantons Moduli Firewall (Capability 202).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.donaldson_gauge_moduli_firewall import (
    get_donaldson_gauge_moduli_firewall_service,
)

router = APIRouter(
    prefix="/api/donaldson-gauge-moduli",
    tags=["Donaldson Gauge Moduli Firewall"],
)

class EvaluateDonaldsonInvariantsRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of 4-manifold to evaluate")
    second_chern_number: Optional[int] = Field(2, description="Second Chern number c2")
    b2_plus: Optional[int] = Field(3, description="Positive second Betti number b2+")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")

@router.get("/manifolds")
async def list_manifolds():
    service = get_donaldson_gauge_moduli_firewall_service()
    return {"manifolds": service.list_manifolds()}

@router.post("/evaluate-donaldson-invariants")
async def evaluate_donaldson_invariants(request: EvaluateDonaldsonInvariantsRequest):
    service = get_donaldson_gauge_moduli_firewall_service()
    try:
        return service.evaluate_donaldson_invariants(
            manifold_id=request.manifold_id,
            second_chern_number=request.second_chern_number or 2,
            b2_plus=request.b2_plus or 3,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_donaldson_gauge_moduli_firewall_service()
    return service.get_metrics()
