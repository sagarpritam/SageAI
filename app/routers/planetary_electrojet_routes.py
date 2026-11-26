from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_geomagnetic_substorm_electrojet_supergrid import (
    get_planetary_geomagnetic_substorm_electrojet_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-electrojet", tags=["Wave 76 Planetary Electrojet"])


class ElectrojetHarvestRequest(BaseModel):
    electrojet_id: str = "ELECTROJET-WESTWARD-01"
    substorm_multiplier: float = 1.05
    induction_efficiency: float = 0.996
    dispatch_duration_s: float = 60.0


@router.get("/electrojets")
async def list_electrojets():
    return get_planetary_geomagnetic_substorm_electrojet_supergrid_service().list_electrojets()


@router.post("/harvest-electrojet-power")
async def harvest_electrojet_power(req: ElectrojetHarvestRequest):
    return get_planetary_geomagnetic_substorm_electrojet_supergrid_service().harvest_electrojet_power(
        electrojet_id=req.electrojet_id,
        substorm_multiplier=req.substorm_multiplier,
        induction_efficiency=req.induction_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_geomagnetic_substorm_electrojet_supergrid_service().get_metrics()
