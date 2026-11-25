"""
FastAPI Router for Atiyah-Singer Index & Heat Kernel Anomaly Firewall (Capability 205).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.atiyah_singer_index_heat_kernel_firewall import (
    get_atiyah_singer_index_heat_kernel_firewall_service,
)

router = APIRouter(
    prefix="/api/atiyah-singer-index-heat-kernel",
    tags=["Atiyah-Singer Index Heat Kernel Firewall"],
)


class EvaluateIndexHeatKernelRequest(BaseModel):
    operator_id: str = Field(..., description="ID of Dirac operator to evaluate")
    manifold_dimension: Optional[int] = Field(4, description="Dimension of spin manifold")
    chern_rank: Optional[int] = Field(2, description="Rank of twisting vector bundle E")
    firewall_gain: Optional[float] = Field(1.25, description="Firewall gain multiplier")


@router.get("/operators")
async def list_operators():
    service = get_atiyah_singer_index_heat_kernel_firewall_service()
    return {"operators": service.list_operators()}


@router.post("/evaluate-index-heat-kernel")
async def evaluate_index_heat_kernel(request: EvaluateIndexHeatKernelRequest):
    service = get_atiyah_singer_index_heat_kernel_firewall_service()
    try:
        return service.evaluate_index_heat_kernel(
            operator_id=request.operator_id,
            manifold_dimension=request.manifold_dimension or 4,
            chern_rank=request.chern_rank or 2,
            firewall_gain=request.firewall_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_atiyah_singer_index_heat_kernel_firewall_service()
    return service.get_metrics()
