"""
FastAPI Router for Kontsevich Cyclic Homotopy & A-Infinity Formality Firewall (Capability 208).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.kontsevich_cyclic_homotopy_firewall import (
    get_kontsevich_cyclic_homotopy_firewall_service,
)

router = APIRouter(
    prefix="/api/kontsevich-cyclic-homotopy",
    tags=["Kontsevich Cyclic Homotopy Firewall"],
)


class EvaluateCyclicFormalityRequest(BaseModel):
    algebra_id: str = Field(..., description="ID of cyclic A-infinity algebra")
    arity_m_k: Optional[int] = Field(3, description="A-infinity higher product arity m_k")
    cyclic_degree: Optional[int] = Field(2, description="Cyclic homology degree")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")


@router.get("/algebras")
async def list_algebras():
    service = get_kontsevich_cyclic_homotopy_firewall_service()
    return {"algebras": service.list_algebras()}


@router.post("/evaluate-cyclic-formality")
async def evaluate_cyclic_formality(request: EvaluateCyclicFormalityRequest):
    service = get_kontsevich_cyclic_homotopy_firewall_service()
    try:
        return service.evaluate_cyclic_formality(
            algebra_id=request.algebra_id,
            arity_m_k=request.arity_m_k or 3,
            cyclic_degree=request.cyclic_degree if request.cyclic_degree is not None else 2,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_kontsevich_cyclic_homotopy_firewall_service()
    return service.get_metrics()
