from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.kitaev_honeycomb_bus import kitaev_honeycomb_service

router = APIRouter(
    prefix="/api/infrastructure/kitaev-honeycomb-bus",
    tags=["Kitaev Honeycomb Toric Spin-Liquid Bus"],
)


class ModulateKitaevRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Kitaev Honeycomb channel identifier"
    )
    flux_bias_rad: Optional[float] = Field(
        0.5236, description="Z2 vortex flux bias in radians"
    )


@router.get("/telemetry")
async def get_kitaev_telemetry():
    return kitaev_honeycomb_service.get_telemetry()


@router.get("/channels")
async def list_kitaev_channels():
    return kitaev_honeycomb_service.list_channels()


@router.post("/modulate-kitaev")
async def modulate_kitaev_channel(request: ModulateKitaevRequest):
    return kitaev_honeycomb_service.modulate_kitaev(
        channel_id=request.channel_id,
        flux_bias_rad=request.flux_bias_rad
        if request.flux_bias_rad is not None
        else 0.5236,
    )
