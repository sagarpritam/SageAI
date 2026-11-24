from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.modular_kms_backbone import modular_kms_service

router = APIRouter(
    prefix="/api/infrastructure/modular-kms", tags=["Modular KMS Backbone"]
)


class AutomorphismEvolveRequest(BaseModel):
    channel_id: str = "TOMITA-MODULAR-ALPHA"
    flow_time_t: Optional[float] = 14.5


@router.get("/telemetry")
def get_modular_kms_telemetry():
    return modular_kms_service.get_telemetry()


@router.get("/channels")
def get_modular_kms_channels():
    return modular_kms_service.list_channels()


@router.post("/evolve-automorphism")
def evolve_automorphism(req: AutomorphismEvolveRequest):
    return modular_kms_service.evolve_automorphism(
        channel_id=req.channel_id, flow_time_t=req.flow_time_t or 14.5
    )
