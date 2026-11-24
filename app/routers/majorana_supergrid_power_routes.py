"""
FastAPI Router for Option B Wave 47: 2e^2/h Conductance Peak Energy Harvesting & Majorana Supergrid.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.majorana_supergrid_power.majorana_supergrid_power import (
    get_majorana_supergrid_power_service,
)

router = APIRouter(
    prefix="/api/majorana-supergrid-power",
    tags=["Option B Wave 47: Majorana Supergrid Power"],
)


class HarvestMajoranaRequest(BaseModel):
    array_id: str = Field(..., description="ID of the Majorana nanowire power array")
    zeeman_field_tesla: float = Field(
        default=1.5,
        ge=0.1,
        le=10.0,
        description="Applied magnetic Zeeman field in Tesla",
    )
    chemical_potential_mu_mev: float = Field(
        default=0.5,
        ge=0.0,
        le=5.0,
        description="Semiconductor chemical potential in meV",
    )
    supercurrent_bias_ma: float = Field(
        default=4.2, ge=0.1, le=50.0, description="DC supercurrent bias in mA"
    )
    grid_gain: float = Field(
        default=1.0, ge=0.5, le=3.0, description="Cryogenic grid rectification gain"
    )


@router.get("/arrays")
async def list_majorana_power_arrays():
    """List registered Majorana zero mode power arrays."""
    svc = get_majorana_supergrid_power_service()
    return {"arrays": svc.get_arrays()}


@router.post("/harvest-majorana")
async def harvest_majorana_power(request: HarvestMajoranaRequest):
    """Harvest quantized clean superconducting electrical energy from Majorana zero modes."""
    svc = get_majorana_supergrid_power_service()
    try:
        return svc.harvest_majorana(
            array_id=request.array_id,
            zeeman_field_tesla=request.zeeman_field_tesla,
            chemical_potential_mu_mev=request.chemical_potential_mu_mev,
            supercurrent_bias_ma=request.supercurrent_bias_ma,
            grid_gain=request.grid_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_majorana_power_metrics():
    """Return aggregate telemetry metrics for Majorana supergrid power."""
    svc = get_majorana_supergrid_power_service()
    return svc.get_metrics()
