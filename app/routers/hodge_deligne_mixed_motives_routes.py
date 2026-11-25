"""
FastAPI Router for Hodge-Deligne Mixed Hodge Structures Barrier (Capability 210).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.hodge_deligne_mixed_motives_barrier import (
    get_hodge_deligne_mixed_motives_barrier_service,
)

router = APIRouter(
    prefix="/api/hodge-deligne-mixed-motives",
    tags=["Hodge-Deligne Mixed Hodge Barrier"],
)


class EvaluateMixedHodgeRequest(BaseModel):
    structure_id: str = Field(..., description="ID of Mixed Hodge structure")
    weight_filtration_k: Optional[int] = Field(2, description="Weight filtration index k")
    hodge_filtration_p: Optional[int] = Field(1, description="Hodge filtration index p")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")


@router.get("/structures")
async def list_structures():
    service = get_hodge_deligne_mixed_motives_barrier_service()
    return {"structures": service.list_structures()}


@router.post("/evaluate-mixed-hodge")
async def evaluate_mixed_hodge(request: EvaluateMixedHodgeRequest):
    service = get_hodge_deligne_mixed_motives_barrier_service()
    try:
        return service.evaluate_mixed_hodge(
            structure_id=request.structure_id,
            weight_filtration_k=request.weight_filtration_k or 2,
            hodge_filtration_p=request.hodge_filtration_p or 1,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_hodge_deligne_mixed_motives_barrier_service()
    return service.get_metrics()
