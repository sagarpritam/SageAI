"""
FastAPI router for Capability 182: Yau-Tian-Donaldson K-Stability & Kähler-Einstein Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.yau_tian_donaldson_k_stability_shield import (
    get_yau_tian_donaldson_k_stability_shield_service,
)

router = APIRouter(
    prefix="/api/yau-tian-donaldson-k-stability",
    tags=["YTD K-Stability Shield"],
)


class VerifyKStabilityRequest(BaseModel):
    variety_id: str = Field(..., description="ID of the complex Fano variety")
    test_configuration_exponent: int = Field(
        default=2, ge=1, le=10, description="Test configuration exponent"
    )
    coercivity_threshold: float = Field(
        default=0.05, ge=1e-4, le=1.0, description="Ding functional coercivity threshold"
    )
    kahler_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Kähler-Einstein metric gain"
    )


@router.get("/varieties")
async def list_fano_varieties():
    """List registered complex Fano algebraic varieties."""
    svc = get_yau_tian_donaldson_k_stability_shield_service()
    return {"varieties": svc.get_varieties()}


@router.post("/verify-k-stability")
async def verify_k_stability(request: VerifyKStabilityRequest):
    """Verify K-polystability and enforce Kähler-Einstein metric solvability."""
    svc = get_yau_tian_donaldson_k_stability_shield_service()
    try:
        return svc.verify_k_stability(
            variety_id=request.variety_id,
            test_configuration_exponent=request.test_configuration_exponent,
            coercivity_threshold=request.coercivity_threshold,
            kahler_gain=request.kahler_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_k_stability_metrics():
    """Get telemetry metrics for YTD K-stability shield."""
    svc = get_yau_tian_donaldson_k_stability_shield_service()
    return svc.get_metrics()
