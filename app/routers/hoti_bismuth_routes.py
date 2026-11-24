from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.hoti_bismuth_backbone import hoti_bismuth_service

router = APIRouter(
    prefix="/api/infrastructure/hoti-bismuth", tags=["HOTI Bismuth Backbone"]
)


class TuneCornerModeRequest(BaseModel):
    channel_id: str = "BISMUTH-HINGE-01"
    bias_potential_mv: Optional[float] = 15.0


@router.get("/telemetry")
def get_telemetry() -> Dict[str, Any]:
    return hoti_bismuth_service.get_telemetry()


@router.get("/channels")
def get_channels() -> List[Dict[str, Any]]:
    return hoti_bismuth_service.get_channels()


@router.post("/tune-corner-mode")
def tune_corner_mode(req: TuneCornerModeRequest) -> Dict[str, Any]:
    return hoti_bismuth_service.tune_corner_mode(
        channel_id=req.channel_id, bias_potential_mv=req.bias_potential_mv or 15.0
    )
