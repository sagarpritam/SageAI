from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.majorana_nanowire_backbone import (
    majorana_nanowire_service,
)

router = APIRouter(
    prefix="/api/infrastructure/majorana-nanowire",
    tags=["Majorana Nanowire Shuttle Backbone"],
)


class ShuttleBraidRequest(BaseModel):
    channel_id: str = "INAS-AL-NANOWIRE-ALPHA"
    gate_bias_mv: Optional[float] = 45.0


@router.get("/telemetry")
def get_telemetry() -> Dict[str, Any]:
    return majorana_nanowire_service.get_telemetry()


@router.get("/channels")
def get_channels() -> List[Dict[str, Any]]:
    return majorana_nanowire_service.get_channels()


@router.post("/shuttle-braid")
def shuttle_braid(req: ShuttleBraidRequest) -> Dict[str, Any]:
    return majorana_nanowire_service.shuttle_braid(
        channel_id=req.channel_id, gate_bias_mv=req.gate_bias_mv or 45.0
    )
