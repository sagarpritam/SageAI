"""
FastAPI router for Option B Wave 55: Planetary D'' Layer Ultralow-Velocity Zone (ULVZ) Magneto-Thermal Waveguide Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ulvz_magneto_thermal_waveguide_supergrid import (
    get_ulvz_magneto_thermal_waveguide_supergrid_service,
)

router = APIRouter(
    prefix="/api/ulvz-magneto-thermal-waveguide-supergrid",
    tags=["ULVZ Magneto-Thermal Waveguide Supergrid"],
)


class HarvestWaveguidePowerRequest(BaseModel):
    array_id: str = Field(..., description="ID of the ULVZ waveguide array")
    iron_enrichment_override_x_fe: float = Field(
        default=0.18, ge=0.10, le=0.35, description="Basal post-perovskite iron enrichment fraction x_Fe"
    )
    waveguide_efficiency: float = Field(
        default=0.95, ge=0.5, le=1.0, description="Magneto-thermal waveguide coupling efficiency"
    )
    dispatch_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Continuous baseload dispatch duration in seconds"
    )


@router.get("/arrays")
async def list_ulvz_arrays():
    """List registered core-mantle boundary ULVZ waveguide arrays."""
    svc = get_ulvz_magneto_thermal_waveguide_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-waveguide-power")
async def harvest_waveguide_power(request: HarvestWaveguidePowerRequest):
    """Harvest multi-GW electrical power from core-mantle boundary ULVZ basal slurry conduction."""
    svc = get_ulvz_magneto_thermal_waveguide_supergrid_service()
    try:
        return svc.harvest_waveguide_power(
            array_id=request.array_id,
            iron_enrichment_override_x_fe=request.iron_enrichment_override_x_fe,
            waveguide_efficiency=request.waveguide_efficiency,
            dispatch_duration_s=request.dispatch_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_ulvz_supergrid_metrics():
    """Get operational telemetry metrics for ULVZ waveguide supergrid."""
    svc = get_ulvz_magneto_thermal_waveguide_supergrid_service()
    return svc.get_metrics()
