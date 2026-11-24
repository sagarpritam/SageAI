from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.moore_read_bus import moore_read_service

router = APIRouter(
    prefix="/api/infrastructure/moore-read-pfaffian",
    tags=["Moore-Read Pfaffian Non-Abelian Bus"],
)


class ModulatePfaffianRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Moore-Read Pfaffian channel identifier"
    )
    majorana_phase_rad: Optional[float] = Field(
        0.7854, description="Non-Abelian Majorana phase in radians"
    )


@router.get("/telemetry")
async def get_moore_read_telemetry():
    return moore_read_service.get_telemetry()


@router.get("/channels")
async def list_moore_read_channels():
    return moore_read_service.list_channels()


@router.post("/modulate-pfaffian")
async def modulate_pfaffian_channel(request: ModulatePfaffianRequest):
    return moore_read_service.modulate_pfaffian(
        channel_id=request.channel_id,
        majorana_phase_rad=request.majorana_phase_rad
        if request.majorana_phase_rad is not None
        else 0.7854,
    )
