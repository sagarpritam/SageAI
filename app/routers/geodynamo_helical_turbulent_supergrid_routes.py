"""
FastAPI router for Option B Wave 53: Planetary Outer-Core Geodynamo Helical Induction Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.geodynamo_helical_turbulent_supergrid import (
    get_geodynamo_helical_turbulent_supergrid_service,
)

router = APIRouter(
    prefix="/api/geodynamo-helical-turbulent-supergrid",
    tags=["Geodynamo Helical Turbulent Supergrid"],
)


class HarvestInductionPowerRequest(BaseModel):
    array_id: str = Field(..., description="ID of the outer-core dynamo array")
    helicity_override_alpha: float = Field(
        default=0.045, ge=0.01, le=0.1, description="Turbulent alpha-effect helicity"
    )
    induction_efficiency: float = Field(
        default=0.95, ge=0.5, le=1.0, description="Electromagnetic induction coupling efficiency"
    )
    dispatch_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Continuous dispatch duration in seconds"
    )


@router.get("/arrays")
async def list_dynamo_arrays():
    """List registered outer-core geodynamo induction arrays."""
    svc = get_geodynamo_helical_turbulent_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-induction-power")
async def harvest_induction_power(request: HarvestInductionPowerRequest):
    """Harvest multi-GW electrical power from helical geodynamo turbulence."""
    svc = get_geodynamo_helical_turbulent_supergrid_service()
    try:
        return svc.harvest_induction_power(
            array_id=request.array_id,
            helicity_override_alpha=request.helicity_override_alpha,
            induction_efficiency=request.induction_efficiency,
            dispatch_duration_s=request.dispatch_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_dynamo_metrics():
    """Return operational metrics for geodynamo induction supergrid."""
    svc = get_geodynamo_helical_turbulent_supergrid_service()
    return svc.get_metrics()
