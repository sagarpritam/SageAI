from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.lurie_topos_spectral_bus import lurie_topos_service

router = APIRouter(
    prefix="/api/infrastructure/lurie-topos-spectral-bus",
    tags=["Lurie Infinity-Topos Spectral Sheaf Hypergrid Bus"],
)


class ModulateLurieRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Lurie infinity-topos spectral sheaf channel identifier"
    )
    coherence_bias_rad: Optional[float] = Field(
        1.618, description="Lurie spectral sheaf coherence bias parameter in radians"
    )


@router.get("/telemetry")
async def get_lurie_telemetry():
    return lurie_topos_service.get_telemetry()


@router.get("/channels")
async def list_lurie_channels():
    return lurie_topos_service.get_channels()


@router.post("/modulate-lurie")
async def modulate_lurie_channel(request: ModulateLurieRequest):
    return lurie_topos_service.modulate_lurie(
        channel_id=request.channel_id,
        coherence_bias_rad=request.coherence_bias_rad
        if request.coherence_bias_rad is not None
        else 1.618,
    )
