"""
FastAPI router for Option B Wave 54: Planetary Mantle Transition Zone Wadsleyite Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.mantle_transition_zone_wadsleyite_supergrid import (
    get_mantle_transition_zone_wadsleyite_supergrid_service,
)

router = APIRouter(
    prefix="/api/mantle-transition-zone-wadsleyite-supergrid",
    tags=["Mantle Transition Zone Wadsleyite Supergrid"],
)


class HarvestProtonConductionRequest(BaseModel):
    array_id: str = Field(..., description="ID of the mantle transition zone array")
    water_content_override_wt_pct: float = Field(
        default=2.15, ge=0.5, le=3.5, description="Ringwoodite/wadsleyite hydrous water content in wt%"
    )
    induction_efficiency: float = Field(
        default=0.95, ge=0.5, le=1.0, description="Telluric inductive coupling efficiency"
    )
    dispatch_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Continuous baseload dispatch duration in seconds"
    )


@router.get("/arrays")
async def list_transition_zone_arrays():
    """List registered mantle transition zone hydrous wadsleyite arrays."""
    svc = get_mantle_transition_zone_wadsleyite_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-proton-conduction")
async def harvest_proton_conduction(request: HarvestProtonConductionRequest):
    """Harvest multi-GW electrical power from wadsleyite-ringwoodite proton conduction."""
    svc = get_mantle_transition_zone_wadsleyite_supergrid_service()
    try:
        return svc.harvest_proton_conduction(
            array_id=request.array_id,
            water_content_override_wt_pct=request.water_content_override_wt_pct,
            induction_efficiency=request.induction_efficiency,
            dispatch_duration_s=request.dispatch_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_wadsleyite_supergrid_metrics():
    """Get operational telemetry metrics for mantle transition zone supergrid."""
    svc = get_mantle_transition_zone_wadsleyite_supergrid_service()
    return svc.get_metrics()
