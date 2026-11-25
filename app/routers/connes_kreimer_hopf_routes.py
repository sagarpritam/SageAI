"""
FastAPI Router for Connes-Kreimer Hopf Renormalization & Rooted Trees Firewall (Capability 196).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.connes_kreimer_hopf_firewall import (
    get_connes_kreimer_hopf_firewall_service,
)

router = APIRouter(
    prefix="/api/connes-kreimer-hopf",
    tags=["Connes-Kreimer Hopf Firewall"],
)

class EvaluateBirkhoffDecompositionRequest(BaseModel):
    graph_id: str = Field(..., description="ID of Feynman graph to evaluate")
    loop_order: Optional[int] = Field(2, description="Loop order of graph")
    dimensional_epsilon: Optional[float] = Field(0.01, description="Dimensional regularization parameter")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")

@router.get("/graphs")
async def list_graphs():
    service = get_connes_kreimer_hopf_firewall_service()
    return {"graphs": service.list_graphs()}

@router.post("/evaluate-birkhoff-decomposition")
async def evaluate_birkhoff_decomposition(request: EvaluateBirkhoffDecompositionRequest):
    service = get_connes_kreimer_hopf_firewall_service()
    try:
        return service.evaluate_birkhoff_decomposition(
            graph_id=request.graph_id,
            loop_order=request.loop_order or 2,
            dimensional_epsilon=request.dimensional_epsilon or 0.01,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    service = get_connes_kreimer_hopf_firewall_service()
    return service.get_metrics()
