from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.casimir_vacuum_harvester import casimir_vacuum_harvester

router = APIRouter(
    prefix="/api/casimir-vacuum",
    tags=["Dynamic Casimir Relativistic Vacuum Harvester (Cap 84)"],
)


class HarvestVacuumFluxRequest(BaseModel):
    resonator_id: str = Field(..., examples=["CASIMIR-CAVITY-DELFT-01"])
    pump_power_mw: float = Field(default=50.0, ge=1.0, le=500.0)
    pulse_duration_us: float = Field(default=100.0, ge=1.0, le=10000.0)


@router.get("/resonators")
async def get_resonators() -> List[Dict[str, Any]]:
    return casimir_vacuum_harvester.list_resonators()


@router.post("/harvest-flux")
async def harvest_flux(req: HarvestVacuumFluxRequest) -> Dict[str, Any]:
    try:
        return casimir_vacuum_harvester.harvest_vacuum_flux(
            resonator_id=req.resonator_id,
            pump_power_mw=req.pump_power_mw,
            pulse_duration_us=req.pulse_duration_us,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return casimir_vacuum_harvester.get_resonator_metrics()
