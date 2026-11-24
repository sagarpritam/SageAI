from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.morava_k_theory_bus import morava_k_theory_service

router = APIRouter(
    prefix="/api/infrastructure/morava-k-theory-bus",
    tags=["Moore-Tate Morava K-Theory Chromatic Interconnect Bus"],
)


class ModulateMoravaRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Morava chromatic channel identifier"
    )
    formal_group_bias_rad: Optional[float] = Field(
        1.4142, description="Formal group law bias angle in radians"
    )


@router.get("/telemetry")
async def get_morava_telemetry():
    return morava_k_theory_service.get_telemetry()


@router.get("/channels")
async def list_morava_channels():
    return morava_k_theory_service.list_channels()


@router.post("/modulate-morava")
async def modulate_morava_channel(request: ModulateMoravaRequest):
    return morava_k_theory_service.modulate_morava(
        channel_id=request.channel_id,
        formal_group_bias_rad=request.formal_group_bias_rad
        if request.formal_group_bias_rad is not None
        else 1.4142,
    )
