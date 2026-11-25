"""
FastAPI router for Capability 190: David Kazhdan & George Lusztig Polynomials & Hecke Algebra Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.kazhdan_lusztig_hecke_firewall import (
    get_kazhdan_lusztig_hecke_firewall_service,
)

router = APIRouter(
    prefix="/api/kazhdan-lusztig-hecke",
    tags=["Kazhdan-Lusztig Hecke Firewall"],
)


class EvaluateKLPolynomialRequest(BaseModel):
    pair_id: str = Field(..., description="ID of the Bruhat order pair configuration")
    hecke_q_parameter: float = Field(
        default=1.0, ge=0.1, le=10.0, description="Iwahori-Hecke algebra quantum deformation parameter q"
    )
    kazhdan_inversion_order: int = Field(
        default=4, ge=1, le=16, description="Kazhdan-Lusztig canonical inversion order"
    )
    firewall_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Schubert intersection cohomology firewall gain"
    )


@router.get("/pairs")
async def list_bruhat_pairs():
    """List registered Bruhat pairs and Weyl group configurations."""
    svc = get_kazhdan_lusztig_hecke_firewall_service()
    return {"pairs": svc.get_pairs()}


@router.post("/evaluate-kl-polynomial")
async def evaluate_kl_polynomial(request: EvaluateKLPolynomialRequest):
    """Evaluate Kazhdan-Lusztig polynomial and enforce canonical basis self-duality."""
    svc = get_kazhdan_lusztig_hecke_firewall_service()
    try:
        return svc.evaluate_kl_polynomial(
            pair_id=request.pair_id,
            hecke_q_parameter=request.hecke_q_parameter,
            kazhdan_inversion_order=request.kazhdan_inversion_order,
            firewall_gain=request.firewall_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_kl_firewall_metrics():
    """Get operational telemetry metrics for Kazhdan-Lusztig Hecke algebra firewall."""
    svc = get_kazhdan_lusztig_hecke_firewall_service()
    return svc.get_metrics()
