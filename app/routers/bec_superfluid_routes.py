from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.bec_superfluid_bus import bec_superfluid_bus

router = APIRouter(
    prefix="/api/infrastructure/bec-superfluid", tags=["BEC Superfluid Bus"]
)


class ModulateFlowRequest(BaseModel):
    channel_id: Optional[str] = "BEC-CONDENSATE-ALPHA"
    target_velocity_mm_s: Optional[float] = 3.25


@router.get("/telemetry")
async def get_telemetry():
    return bec_superfluid_bus.get_telemetry()


@router.get("/channels")
async def get_channels():
    return bec_superfluid_bus.get_channels()


@router.post("/modulate-flow")
async def modulate_flow(req: ModulateFlowRequest):
    return bec_superfluid_bus.modulate_flow(
        channel_id=req.channel_id, target_velocity_mm_s=req.target_velocity_mm_s
    )
