from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_mesospheric_noctilucent_plasma_induction_supergrid import (
    get_planetary_mesospheric_noctilucent_plasma_induction_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-mesospheric-plasma", tags=["Wave 67 Planetary Mesospheric Plasma"])


class MesosphericHarvestRequest(BaseModel):
    layer_id: str = "MESOPAUSE-NOCTILUCENT-01"
    electrojet_multiplier: float = 1.05
    plasma_efficiency: float = 0.987
    dispatch_duration_s: float = 60.0


@router.get("/layers")
async def list_layers():
    return get_planetary_mesospheric_noctilucent_plasma_induction_supergrid_service().list_layers()


@router.post("/harvest-mesospheric-power")
async def harvest_mesospheric_power(req: MesosphericHarvestRequest):
    return get_planetary_mesospheric_noctilucent_plasma_induction_supergrid_service().harvest_mesospheric_power(
        layer_id=req.layer_id,
        electrojet_multiplier=req.electrojet_multiplier,
        plasma_efficiency=req.plasma_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_mesospheric_noctilucent_plasma_induction_supergrid_service().get_metrics()
