from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.spinor_bec_bus import spinor_bec_bus

router = APIRouter(
    prefix="/api/infrastructure/spinor-bec-magnon", tags=["Spinor BEC Magnon Bus"]
)


class ModulateMagnonRequest(BaseModel):
    channel_id: Optional[str] = "SPINOR-FERRO-ALPHA"
    spin_stiffness_nj_m: Optional[float] = 2.45


@router.get("/telemetry")
async def get_telemetry():
    return spinor_bec_bus.get_telemetry()


@router.get("/channels")
async def get_channels():
    return spinor_bec_bus.get_channels()


@router.post("/modulate-magnon")
async def modulate_magnon(req: ModulateMagnonRequest):
    return spinor_bec_bus.modulate_magnon(
        channel_id=req.channel_id, spin_stiffness_nj_m=req.spin_stiffness_nj_m
    )
