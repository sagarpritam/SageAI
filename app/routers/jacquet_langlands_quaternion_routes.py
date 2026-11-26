from fastapi import APIRouter
from pydantic import BaseModel
from app.services.jacquet_langlands_quaternion_shimura_shield import (
    get_jacquet_langlands_quaternion_shimura_shield_service,
)

router = APIRouter(prefix="/api/jacquet-langlands-quaternion", tags=["Wave 69 Jacquet-Langlands"])


class QuaternionTransferRequest(BaseModel):
    correspondence_id: str = "JACQUET-LANGLANDS-GL2-01"
    quaternion_discriminant: int = 6
    level_n: int = 11
    shield_gain: float = 1.25


@router.get("/correspondences")
async def list_correspondences():
    return get_jacquet_langlands_quaternion_shimura_shield_service().list_correspondences()


@router.post("/evaluate-quaternion-transfer")
async def evaluate_quaternion_transfer(req: QuaternionTransferRequest):
    return get_jacquet_langlands_quaternion_shimura_shield_service().evaluate_quaternion_transfer(
        correspondence_id=req.correspondence_id,
        quaternion_discriminant=req.quaternion_discriminant,
        level_n=req.level_n,
        shield_gain=req.shield_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_jacquet_langlands_quaternion_shimura_shield_service().get_metrics()
