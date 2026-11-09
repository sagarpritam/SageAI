from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.dark_energy_harvester import dark_energy_harvester

router = APIRouter(
    prefix="/api/dark-energy",
    tags=["Dark Energy Quintessence & Inflaton Metric Harvester (Cap 83)"],
)


class StabilizeInflatonFieldRequest(BaseModel):
    harvester_id: str = Field(..., examples=["DARK-ENERGY-ATACAMA-01"])
    target_metric_region: str = Field(
        default="LOCAL_SOLAR_WARP_SECTOR_4", examples=["LOCAL_SOLAR_WARP_SECTOR_4"]
    )
    coupling_factor: float = Field(default=1.0, ge=0.1, le=10.0)


@router.get("/harvesters")
async def get_harvesters() -> List[Dict[str, Any]]:
    return dark_energy_harvester.list_harvesters()


@router.post("/stabilize-field")
async def stabilize_field(req: StabilizeInflatonFieldRequest) -> Dict[str, Any]:
    try:
        return dark_energy_harvester.stabilize_inflaton_field(
            harvester_id=req.harvester_id,
            target_metric_region=req.target_metric_region,
            coupling_factor=req.coupling_factor,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return dark_energy_harvester.get_harvest_metrics()
