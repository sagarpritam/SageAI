"""
FastAPI Router for Capability 169: Twisted K-Theory D-Brane Ramond-Ramond Charge Shield & Freed-Witten Anomaly Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.twisted_k_theory.twisted_k_theory import (
    get_twisted_k_theory_service,
)

router = APIRouter(
    prefix="/api/twisted-k-theory",
    tags=["Capability 169: Twisted K-Theory Shield"],
)


class CancelAnomalyRequest(BaseModel):
    complex_id: str = Field(..., description="ID of the twisted K-theory complex")
    dixmier_douady_flux: int = Field(
        default=3, ge=1, le=32, description="Dixmier-Douady characteristic class [H]"
    )
    ahss_filtration_depth: int = Field(
        default=6,
        ge=1,
        le=16,
        description="Atiyah-Hirzebruch spectral sequence filtration depth",
    )
    branes_charge_n: int = Field(
        default=4, ge=1, le=32, description="D-brane Ramond-Ramond charge multiplicity"
    )
    cancellation_gain: float = Field(
        default=1.2, ge=0.5, le=3.0, description="Freed-Witten firewall gain"
    )


@router.get("/complexes")
async def list_twisted_k_complexes():
    """List registered twisted K-theory complexes."""
    svc = get_twisted_k_theory_service()
    return {"complexes": svc.get_complexes()}


@router.post("/cancel-anomaly")
async def cancel_freed_witten_anomaly(request: CancelAnomalyRequest):
    """Cancel Freed-Witten anomalies and seal D-brane Ramond-Ramond charges."""
    svc = get_twisted_k_theory_service()
    try:
        return svc.cancel_anomaly(
            complex_id=request.complex_id,
            dixmier_douady_flux=request.dixmier_douady_flux,
            ahss_filtration_depth=request.ahss_filtration_depth,
            branes_charge_n=request.branes_charge_n,
            cancellation_gain=request.cancellation_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_twisted_k_theory_metrics():
    """Return aggregate telemetry metrics for Twisted K-Theory shield."""
    svc = get_twisted_k_theory_service()
    return svc.get_metrics()
