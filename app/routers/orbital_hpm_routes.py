from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.orbital_hpm_grid import orbital_hpm_grid

router = APIRouter(
    prefix="/api/orbital-hpm",
    tags=[
        "Orbital High-Power Microwave (HPM) Electronics Directed Energy Grid (Option B)"
    ],
)


class FireHPMPulseRequest(BaseModel):
    satellite_id: str = Field(..., description="Target HPM satellite ID")
    target_identifier: str = Field(
        default="RADAR-BATTERY-S400-SECTOR-9", description="Target identifier"
    )
    target_category: str = Field(
        default="SAM_RADAR_PHASED_ARRAY", description="Target category"
    )
    pulse_duration_ns: float = Field(
        default=250.0, ge=10.0, le=5000.0, description="Pulse duration in nanoseconds"
    )


@router.get("/arrays")
async def get_arrays() -> List[Dict[str, Any]]:
    return orbital_hpm_grid.list_satellites()


@router.post("/fire-pulse")
async def fire_pulse(req: FireHPMPulseRequest) -> Dict[str, Any]:
    try:
        return orbital_hpm_grid.fire_hpm_pulse(
            satellite_id=req.satellite_id,
            target_identifier=req.target_identifier,
            target_category=req.target_category,
            pulse_duration_ns=req.pulse_duration_ns,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return orbital_hpm_grid.get_grid_metrics()
