from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.derived_morita_bus import derived_morita_service

router = APIRouter(
    prefix="/api/infrastructure/derived-morita-bus",
    tags=["Derived Morita Symplectic A-Infinity Interconnect Bus"],
)


class ModulateMoritaRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target derived Morita symplectic channel identifier"
    )
    morita_bias_rad: Optional[float] = Field(
        1.618, description="Derived Morita A-infinity bias parameter in radians"
    )


@router.get("/telemetry")
async def get_morita_telemetry():
    return derived_morita_service.get_telemetry()


@router.get("/channels")
async def list_morita_channels():
    return derived_morita_service.get_channels()


@router.post("/modulate-morita")
async def modulate_morita_channel(request: ModulateMoritaRequest):
    return derived_morita_service.modulate_morita(
        channel_id=request.channel_id,
        morita_bias_rad=request.morita_bias_rad
        if request.morita_bias_rad is not None
        else 1.618,
    )
