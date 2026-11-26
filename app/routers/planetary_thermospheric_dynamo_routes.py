from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_thermospheric_auroral_birkeland_ion_supergrid import (
    get_planetary_thermospheric_auroral_birkeland_ion_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-thermospheric-dynamo", tags=["Wave 68 Planetary Thermospheric Dynamo"])


class ThermosphericHarvestRequest(BaseModel):
    zone_id: str = "THERMOSPHERE-JOULE-RING-01"
    dynamo_multiplier: float = 1.05
    dynamo_efficiency: float = 0.988
    dispatch_duration_s: float = 60.0


@router.get("/zones")
async def list_zones():
    return get_planetary_thermospheric_auroral_birkeland_ion_supergrid_service().list_zones()


@router.post("/harvest-thermospheric-power")
async def harvest_thermospheric_power(req: ThermosphericHarvestRequest):
    return get_planetary_thermospheric_auroral_birkeland_ion_supergrid_service().harvest_thermospheric_power(
        zone_id=req.zone_id,
        dynamo_multiplier=req.dynamo_multiplier,
        dynamo_efficiency=req.dynamo_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_thermospheric_auroral_birkeland_ion_supergrid_service().get_metrics()
