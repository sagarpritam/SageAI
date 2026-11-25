"""
FastAPI Router for Bloch-Kato Tamagawa Number & Euler System Barrier (Capability 213).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.bloch_kato_tamagawa_number_barrier import (
    get_bloch_kato_tamagawa_number_barrier_service,
)

router = APIRouter(
    prefix="/api/bloch-kato-tamagawa",
    tags=["Bloch-Kato Tamagawa Barrier"],
)


class EvaluateTamagawaNumberRequest(BaseModel):
    system_id: str = Field(..., description="ID of Euler system / motive")
    motive_weight: Optional[int] = Field(2, description="Weight of motive M")
    tamagawa_product: Optional[int] = Field(1, description="Local Tamagawa product")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")


@router.get("/systems")
async def list_systems():
    service = get_bloch_kato_tamagawa_number_barrier_service()
    return {"systems": service.list_systems()}


@router.post("/evaluate-tamagawa-number")
async def evaluate_tamagawa_number(request: EvaluateTamagawaNumberRequest):
    service = get_bloch_kato_tamagawa_number_barrier_service()
    try:
        return service.evaluate_tamagawa_number(
            system_id=request.system_id,
            motive_weight=request.motive_weight or 2,
            tamagawa_product=request.tamagawa_product or 1,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_bloch_kato_tamagawa_number_barrier_service()
    return service.get_metrics()
