"""FastAPI Router for Wave 52 Option B: Planetary Core-Mantle Seebeck Supergrid."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.core_mantle_seebeck_supergrid.core_mantle_seebeck_supergrid import (
    get_core_mantle_seebeck_supergrid_service,
)

router = APIRouter(
    prefix="/api/core-mantle-seebeck-supergrid",
    tags=["Wave 52 Option B: Core-Mantle Seebeck Supergrid"],
)


class HarvestThermalPowerRequest(BaseModel):
    array_id: str = Field(..., description="ID of the core-mantle Seebeck array")
    delta_temp_override_k: float = Field(
        default=1250.0, ge=500.0, le=2500.0, description="Thermal boundary gradient across CMB in Kelvin"
    )
    thermopile_efficiency: float = Field(
        default=0.95, ge=0.5, le=0.999, description="High-ZT nanostructured thermopile efficiency"
    )
    dispatch_duration_s: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Grid dispatch duration in seconds"
    )


@router.get("/arrays")
async def list_seebeck_arrays():
    """List registered core-mantle Seebeck thermopile arrays."""
    svc = get_core_mantle_seebeck_supergrid_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-thermal-power")
async def harvest_seebeck_thermal_power(request: HarvestThermalPowerRequest):
    """Harvest multi-GW electrical power from the core-mantle Seebeck thermal gradient."""
    svc = get_core_mantle_seebeck_supergrid_service()
    try:
        return svc.harvest_thermal_power(
            array_id=request.array_id,
            delta_temp_override_k=request.delta_temp_override_k,
            thermopile_efficiency=request.thermopile_efficiency,
            dispatch_duration_s=request.dispatch_duration_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_seebeck_metrics():
    """Return operational metrics for core-mantle Seebeck supergrid."""
    svc = get_core_mantle_seebeck_supergrid_service()
    return svc.get_metrics()
