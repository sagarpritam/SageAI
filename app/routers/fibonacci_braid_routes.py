from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.fibonacci_braid_computer import fibonacci_braid_service

router = APIRouter(
    prefix="/api/infrastructure/fibonacci-braid", tags=["Fibonacci Braid Computer"]
)


class GateSynthesisRequest(BaseModel):
    channel_id: str = "FIBONACCI-BRAID-ALPHA"
    target_unitary: str = "HADAMARD_TOPOLOGICAL"
    solovay_kitaev_depth: Optional[int] = 32


@router.get("/telemetry")
def get_fibonacci_braid_telemetry():
    return fibonacci_braid_service.get_telemetry()


@router.get("/channels")
def get_fibonacci_braid_channels():
    return fibonacci_braid_service.list_channels()


@router.post("/synthesize-gate")
def synthesize_fibonacci_gate(req: GateSynthesisRequest):
    return fibonacci_braid_service.synthesize_gate(
        channel_id=req.channel_id,
        target_unitary=req.target_unitary,
        solovay_kitaev_depth=req.solovay_kitaev_depth or 32,
    )
