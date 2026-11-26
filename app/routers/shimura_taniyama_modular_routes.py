"""
FastAPI Router for Shimura-Taniyama Modular Parametrization Barrier (Capability 216).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.shimura_taniyama_modular_parametrization_barrier import (
    get_shimura_taniyama_modular_parametrization_barrier_service,
)

router = APIRouter(
    prefix="/api/shimura-taniyama-modular",
    tags=["Shimura-Taniyama Modular Barrier"],
)


class EvaluateModularParametrizationRequest(BaseModel):
    curve_id: str = Field(..., description="ID of modular curve parametrization")
    level_n: Optional[int] = Field(11, description="Modular level N")
    q_truncation_order: Optional[int] = Field(8, description="q-expansion truncation order")
    barrier_gain: Optional[float] = Field(1.25, description="Barrier gain multiplier")


@router.get("/curves")
async def list_curves():
    service = get_shimura_taniyama_modular_parametrization_barrier_service()
    return {"curves": service.list_curves()}


@router.post("/evaluate-modular-parametrization")
async def evaluate_modular_parametrization(request: EvaluateModularParametrizationRequest):
    service = get_shimura_taniyama_modular_parametrization_barrier_service()
    try:
        return service.evaluate_modular_parametrization(
            curve_id=request.curve_id,
            level_n=request.level_n or 11,
            q_truncation_order=request.q_truncation_order or 8,
            barrier_gain=request.barrier_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_shimura_taniyama_modular_parametrization_barrier_service()
    return service.get_metrics()
