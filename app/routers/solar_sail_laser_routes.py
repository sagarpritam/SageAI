from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.solar_sail_laser import relativistic_solar_sail_laser_mesh

router = APIRouter(
    prefix="/api/solar-sail-laser", tags=["Relativistic Solar Sail Laser (Cap 77)"]
)


class FireLaserPulseRequest(BaseModel):
    array_id: str = Field(..., example="LASER-ARRAY-ATACAMA-01")
    target_type: str = Field(..., example="RELATIVISTIC_LIGHTSAIL")
    target_id: str = Field(..., example="STARSHOT-PROBE-ALPHA-01")
    beam_power_gw: float = Field(default=80.0, ge=1.0, le=120.0)
    duration_seconds: float = Field(default=120.0, ge=1.0, le=3600.0)
    target_mass_kg: float = Field(default=5.0, ge=0.001, le=100000000.0)
    sail_area_m2: float = Field(default=16.0, ge=0.1, le=1000000.0)
    reflectivity: float = Field(default=0.9995, ge=0.8, le=1.0)


@router.get("/arrays")
async def get_arrays() -> List[Dict[str, Any]]:
    return relativistic_solar_sail_laser_mesh.list_arrays()


@router.post("/fire-pulse")
async def fire_pulse(req: FireLaserPulseRequest) -> Dict[str, Any]:
    try:
        return relativistic_solar_sail_laser_mesh.fire_propulsion_beam(
            array_id=req.array_id,
            target_type=req.target_type,
            target_id=req.target_id,
            beam_power_gw=req.beam_power_gw,
            duration_seconds=req.duration_seconds,
            target_mass_kg=req.target_mass_kg,
            sail_area_m2=req.sail_area_m2,
            reflectivity=req.reflectivity,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return relativistic_solar_sail_laser_mesh.get_mesh_metrics()
