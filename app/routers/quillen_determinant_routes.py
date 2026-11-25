"""FastAPI Router for Capability 178: Quillen Determinant Line Bundle Firewall."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.quillen_determinant_firewall.quillen_determinant_firewall import (
    get_quillen_determinant_firewall_service,
)

router = APIRouter(
    prefix="/api/quillen-determinant",
    tags=["Capability 178: Quillen Determinant Firewall"],
)


class EvaluateDeterminantRequest(BaseModel):
    bundle_id: str = Field(..., description="ID of the Quillen determinant bundle")
    regularization_cutoff: float = Field(
        default=1e-5, ge=1e-10, le=1e-2, description="Zeta function spectral cutoff threshold"
    )
    zeta_derivative_scale: float = Field(
        default=1.0, ge=0.1, le=5.0, description="Analytic torsion zeta derivative scale"
    )
    firewall_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Determinant line bundle firewall gain"
    )


@router.get("/bundles")
async def list_quillen_bundles():
    """List registered Quillen determinant bundles."""
    svc = get_quillen_determinant_firewall_service()
    return {"bundles": svc.get_bundles()}


@router.post("/evaluate-determinant")
async def evaluate_quillen_determinant(request: EvaluateDeterminantRequest):
    """Evaluate Quillen analytic torsion metric and cancel anomalies."""
    svc = get_quillen_determinant_firewall_service()
    try:
        return svc.evaluate_determinant(
            bundle_id=request.bundle_id,
            regularization_cutoff=request.regularization_cutoff,
            zeta_derivative_scale=request.zeta_derivative_scale,
            firewall_gain=request.firewall_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_quillen_metrics():
    """Return operational metrics for Quillen determinant firewall."""
    svc = get_quillen_determinant_firewall_service()
    return svc.get_metrics()
