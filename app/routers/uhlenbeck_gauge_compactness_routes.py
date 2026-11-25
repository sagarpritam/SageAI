"""
FastAPI router for Capability 179: Uhlenbeck Gauge Theory Compactness Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.uhlenbeck_gauge_compactness_shield import (
    get_uhlenbeck_gauge_compactness_shield_service,
)

router = APIRouter(
    prefix="/api/uhlenbeck-gauge-compactness",
    tags=["Uhlenbeck Gauge Compactness Shield"],
)


class EnforceCompactnessRequest(BaseModel):
    connection_id: str = Field(..., description="ID of the gauge connection configuration")
    curvature_threshold: float = Field(
        default=1e-4, ge=1e-8, le=1e-2, description="Curvature concentration threshold"
    )
    bubbling_radius_delta: float = Field(
        default=0.02, ge=1e-4, le=1.0, description="Instanton bubbling radius delta"
    )
    sobolev_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Sobolev W^{2,p} regularity pinning gain"
    )


@router.get("/configurations")
async def list_gauge_configurations():
    """List registered gauge connection configurations."""
    svc = get_uhlenbeck_gauge_compactness_shield_service()
    return {"configurations": svc.get_configurations()}


@router.post("/enforce-compactness")
async def enforce_gauge_compactness(request: EnforceCompactnessRequest):
    """Enforce Uhlenbeck compactness and remove point singularities."""
    svc = get_uhlenbeck_gauge_compactness_shield_service()
    try:
        return svc.enforce_compactness(
            connection_id=request.connection_id,
            curvature_threshold=request.curvature_threshold,
            bubbling_radius_delta=request.bubbling_radius_delta,
            sobolev_gain=request.sobolev_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_uhlenbeck_metrics():
    """Return operational metrics for Uhlenbeck gauge compactness shield."""
    svc = get_uhlenbeck_gauge_compactness_shield_service()
    return svc.get_metrics()
