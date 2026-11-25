"""
FastAPI Router for Hirzebruch-Riemann-Roch & Todd Genus Shield (Capability 206).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.hirzebruch_riemann_roch_todd_shield import (
    get_hirzebruch_riemann_roch_todd_shield_service,
)

router = APIRouter(
    prefix="/api/hirzebruch-riemann-roch",
    tags=["Hirzebruch-Riemann-Roch Todd Shield"],
)


class EvaluateHrrToddGenusRequest(BaseModel):
    sheaf_id: str = Field(..., description="ID of sheaf/bundle to evaluate")
    complex_dimension: Optional[int] = Field(2, description="Complex dimension of variety X")
    bundle_rank: Optional[int] = Field(3, description="Rank of holomorphic bundle E")
    shield_gain: Optional[float] = Field(1.25, description="Shield gain multiplier")


@router.get("/sheaves")
async def list_sheaves():
    service = get_hirzebruch_riemann_roch_todd_shield_service()
    return {"sheaves": service.list_sheaves()}


@router.post("/evaluate-hrr-todd-genus")
async def evaluate_hrr_todd_genus(request: EvaluateHrrToddGenusRequest):
    service = get_hirzebruch_riemann_roch_todd_shield_service()
    try:
        return service.evaluate_hrr_todd_genus(
            sheaf_id=request.sheaf_id,
            complex_dimension=request.complex_dimension or 2,
            bundle_rank=request.bundle_rank or 3,
            shield_gain=request.shield_gain or 1.25,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    service = get_hirzebruch_riemann_roch_todd_shield_service()
    return service.get_metrics()
