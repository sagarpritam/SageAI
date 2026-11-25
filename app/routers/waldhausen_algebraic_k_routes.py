"""
FastAPI router for Capability 187: Waldhausen Algebraic K-Theory & Motivic Spectral Sequence Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.waldhausen_algebraic_k_firewall import (
    get_waldhausen_algebraic_k_firewall_service,
)

router = APIRouter(
    prefix="/api/waldhausen-algebraic-k",
    tags=["Waldhausen Algebraic K Firewall"],
)


class EvaluateCyclotomicTraceRequest(BaseModel):
    complex_id: str = Field(..., description="ID of the algebraic K-theory complex")
    filtration_degree: int = Field(
        default=3, ge=1, le=10, description="Motivic spectral sequence filtration degree"
    )
    cyclotomic_prime: int = Field(
        default=3, ge=2, le=31, description="Cyclotomic trace evaluation prime p"
    )
    firewall_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Topological cyclic homology gain"
    )


@router.get("/complexes")
async def list_ktheory_complexes():
    """List registered Waldhausen algebraic K-theory complexes."""
    svc = get_waldhausen_algebraic_k_firewall_service()
    return {"complexes": svc.get_complexes()}


@router.post("/evaluate-cyclotomic-trace")
async def evaluate_cyclotomic_trace(request: EvaluateCyclotomicTraceRequest):
    """Evaluate Goodwillie cyclotomic trace and seal arithmetic algebraic K-theory anomalies."""
    svc = get_waldhausen_algebraic_k_firewall_service()
    try:
        return svc.evaluate_cyclotomic_trace(
            complex_id=request.complex_id,
            filtration_degree=request.filtration_degree,
            cyclotomic_prime=request.cyclotomic_prime,
            firewall_gain=request.firewall_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_waldhausen_firewall_metrics():
    """Get operational telemetry metrics for Waldhausen algebraic K-theory firewall."""
    svc = get_waldhausen_algebraic_k_firewall_service()
    return svc.get_metrics()
