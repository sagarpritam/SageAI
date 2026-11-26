from fastapi import APIRouter
from pydantic import BaseModel
from app.services.planetary_stratospheric_jetstream_triboelectric_supergrid import (
    get_planetary_stratospheric_jetstream_triboelectric_supergrid_service,
)

router = APIRouter(prefix="/api/planetary-stratospheric-jetstream", tags=["Wave 66 Planetary Stratospheric Jetstream"])


class JetstreamHarvestRequest(BaseModel):
    stream_id: str = "POLAR-FRONT-JETSTREAM-01"
    rossby_multiplier: float = 1.05
    triboelectric_efficiency: float = 0.986
    dispatch_duration_s: float = 60.0


@router.get("/streams")
async def list_streams():
    return get_planetary_stratospheric_jetstream_triboelectric_supergrid_service().list_streams()


@router.post("/harvest-jetstream-power")
async def harvest_jetstream_power(req: JetstreamHarvestRequest):
    return get_planetary_stratospheric_jetstream_triboelectric_supergrid_service().harvest_jetstream_power(
        stream_id=req.stream_id,
        rossby_multiplier=req.rossby_multiplier,
        triboelectric_efficiency=req.triboelectric_efficiency,
        dispatch_duration_s=req.dispatch_duration_s,
    )


@router.get("/metrics")
async def get_metrics():
    return get_planetary_stratospheric_jetstream_triboelectric_supergrid_service().get_metrics()
