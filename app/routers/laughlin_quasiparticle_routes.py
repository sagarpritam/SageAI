from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.laughlin_quasiparticle_bus import (
    laughlin_quasiparticle_service,
)

router = APIRouter(
    prefix="/api/infrastructure/laughlin-quasiparticle-bus",
    tags=["Laughlin Quasiparticle Interconnect Bus"],
)


class ModulateLaughlinRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Laughlin quasiparticle channel identifier"
    )
    braiding_phase_rad: Optional[float] = Field(
        1.0472, description="Anyonic braiding phase in radians"
    )


@router.get("/telemetry")
async def get_laughlin_telemetry():
    return laughlin_quasiparticle_service.get_telemetry()


@router.get("/channels")
async def list_laughlin_channels():
    return laughlin_quasiparticle_service.list_channels()


@router.post("/modulate-laughlin")
async def modulate_laughlin_channel(request: ModulateLaughlinRequest):
    return laughlin_quasiparticle_service.modulate_laughlin(
        channel_id=request.channel_id,
        braiding_phase_rad=request.braiding_phase_rad or 1.0472,
    )
