"""
FastAPI Router for Capability 118: Conformal Bootstrap SDP & Crossing-Symmetry Auditor.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.conformal_bootstrap.conformal_bootstrap import (
    get_conformal_bootstrap_auditor,
)

router = APIRouter(
    prefix="/api/conformal-bootstrap",
    tags=["Capability 118: Conformal Bootstrap SDP & Crossing-Symmetry Auditor"],
)


class AuditCrossingRequest(BaseModel):
    functional_id: str = Field(
        ..., description="ID of the Conformal Bootstrap SDP functional"
    )
    derivative_order_lambda: int = Field(
        default=27,
        ge=9,
        le=63,
        description="Bootstrap derivative truncation cutoff Lambda",
    )
    max_spin_ell: int = Field(
        default=26,
        ge=6,
        le=60,
        description="Maximum conformal partial wave spin l_max",
    )
    sdp_precision_gain: float = Field(
        default=1.45,
        ge=0.85,
        le=2.5,
        description="SDPB arbitrary-precision dual optimization gain",
    )


@router.get("/functionals")
async def list_functionals():
    """List all registered Conformal Bootstrap SDP functionals."""
    auditor = get_conformal_bootstrap_auditor()
    return {"functionals": auditor.get_functionals()}


@router.post("/audit-crossing")
async def audit_crossing_route(request: AuditCrossingRequest):
    """Execute SDP conformal crossing-symmetry and unitarity bound audit."""
    auditor = get_conformal_bootstrap_auditor()
    try:
        return auditor.audit_crossing_unitarity(
            functional_id=request.functional_id,
            derivative_order_lambda=request.derivative_order_lambda,
            max_spin_ell=request.max_spin_ell,
            sdp_precision_gain=request.sdp_precision_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_bootstrap_metrics():
    """Retrieve aggregate Conformal Bootstrap Auditor metrics."""
    auditor = get_conformal_bootstrap_auditor()
    return auditor.get_bootstrap_metrics()
