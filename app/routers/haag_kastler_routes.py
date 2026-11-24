from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.haag_kastler_bus import haag_kastler_service

router = APIRouter(
    prefix="/api/infrastructure/haag-kastler-bus",
    tags=["Haag-Kastler Axiomatic AQFT Net Bus"],
)


class ModulateHaagRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Haag-Kastler causal channel identifier"
    )
    diamond_volume_m3: Optional[float] = Field(
        0.0125, description="Causal diamond volume in cubic meters"
    )


@router.get("/telemetry")
async def get_haag_telemetry():
    return haag_kastler_service.get_telemetry()


@router.get("/channels")
async def list_haag_channels():
    return haag_kastler_service.list_channels()


@router.post("/modulate-haag")
async def modulate_haag_channel(request: ModulateHaagRequest):
    return haag_kastler_service.modulate_haag(
        channel_id=request.channel_id,
        diamond_volume_m3=request.diamond_volume_m3
        if request.diamond_volume_m3 is not None
        else 0.0125,
    )
