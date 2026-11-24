from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.berry_holonomic_bus import berry_holonomic_bus

router = APIRouter(
    prefix="/api/infrastructure/berry-holonomic", tags=["Berry Holonomic Bus"]
)


class SynthesizeGateRequest(BaseModel):
    channel_id: Optional[str] = "BERRY-PHASE-ALPHA"
    solid_angle_sr: Optional[float] = 1.25


@router.get("/telemetry")
async def get_telemetry():
    return berry_holonomic_bus.get_telemetry()


@router.get("/channels")
async def get_channels():
    return berry_holonomic_bus.get_channels()


@router.post("/synthesize-gate")
async def synthesize_gate(req: SynthesizeGateRequest):
    return berry_holonomic_bus.synthesize_gate(
        channel_id=req.channel_id, solid_angle_sr=req.solid_angle_sr
    )
