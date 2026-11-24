from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.anyon_topological_bus import anyon_topological_bus

router = APIRouter(
    prefix="/api/infrastructure/anyon-topological",
    tags=["Fibonacci Anyon Topological Bus"],
)


class BraidFusionRequest(BaseModel):
    channel_id: Optional[str] = "FIBONACCI-FUSION-ALPHA"
    braid_steps: Optional[int] = 12


@router.get("/telemetry")
async def get_telemetry():
    return anyon_topological_bus.get_telemetry()


@router.get("/channels")
async def get_channels():
    return anyon_topological_bus.get_channels()


@router.post("/braid-fusion")
async def braid_fusion(req: BraidFusionRequest):
    return anyon_topological_bus.braid_fusion(
        channel_id=req.channel_id, braid_steps=req.braid_steps
    )
