"""
FastAPI Routes for Macdonald Symmetric Polynomials & Double Affine Hecke Algebra (DAHA) Barrier (Capability 192).
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.macdonald_daha_polynomial_barrier import (
    get_macdonald_daha_polynomial_barrier_service,
)

router = APIRouter(
    prefix="/api/macdonald-daha-polynomial",
    tags=["Macdonald DAHA Polynomial Barrier"],
)


class EvaluateMacdonaldDualityRequest(BaseModel):
    algebra_id: str = Field("DAHA-GLN-ROOT-01", description="Identifier of the DAHA algebra representation")
    polynomial_degree: int = Field(4, ge=1, le=24, description="Degree of Macdonald symmetric polynomial")
    dunkl_order: int = Field(6, ge=1, le=16, description="Dunkl-Cherednik operator filtration order")
    barrier_gain: float = Field(1.25, ge=0.1, le=10.0, description="DAHA Fourier transform barrier gain")


@router.get("/algebras", summary="List Macdonald DAHA Algebras")
async def list_algebras(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_macdonald_daha_polynomial_barrier_service()
    return {"algebras": svc.get_algebras()}


@router.post("/evaluate-macdonald-duality", summary="Evaluate Macdonald Polynomial & DAHA Duality")
async def evaluate_macdonald_duality(
    req: EvaluateMacdonaldDualityRequest,
    _user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    svc = get_macdonald_daha_polynomial_barrier_service()
    return svc.evaluate_macdonald_duality(
        algebra_id=req.algebra_id,
        polynomial_degree=req.polynomial_degree,
        dunkl_order=req.dunkl_order,
        barrier_gain=req.barrier_gain,
    )


@router.get("/metrics", summary="Get Macdonald DAHA Barrier Telemetry Metrics")
async def get_metrics(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_macdonald_daha_polynomial_barrier_service()
    return svc.get_metrics()
