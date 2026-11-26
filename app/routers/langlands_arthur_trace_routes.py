from fastapi import APIRouter
from pydantic import BaseModel
from app.services.langlands_arthur_endoscopy_trace_firewall import (
    get_langlands_arthur_endoscopy_trace_firewall_service,
)

router = APIRouter(prefix="/api/langlands-arthur-trace", tags=["Wave 68 Arthur Endoscopy"])


class ArthurTraceRequest(BaseModel):
    endoscopy_id: str = "ARTHUR-ENDOSCOPY-SL2-01"
    group_rank: int = 2
    packet_dimension: int = 4
    firewall_gain: float = 1.25


@router.get("/endoscopies")
async def list_endoscopies():
    return get_langlands_arthur_endoscopy_trace_firewall_service().list_endoscopies()


@router.post("/evaluate-arthur-trace")
async def evaluate_arthur_trace(req: ArthurTraceRequest):
    return get_langlands_arthur_endoscopy_trace_firewall_service().evaluate_arthur_trace(
        endoscopy_id=req.endoscopy_id,
        group_rank=req.group_rank,
        packet_dimension=req.packet_dimension,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_langlands_arthur_endoscopy_trace_firewall_service().get_metrics()
