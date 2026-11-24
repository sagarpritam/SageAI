from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.grover_oracle_accelerator import (
    grover_oracle_accelerator,
)

router = APIRouter(
    prefix="/api/infrastructure/grover-oracle", tags=["Grover Oracle Accelerator"]
)


class AccelerateIndexingRequest(BaseModel):
    channel_id: Optional[str] = "GROVER-ORACLE-ALPHA"
    target_queries: Optional[int] = 1000000


@router.get("/telemetry")
async def get_telemetry():
    return grover_oracle_accelerator.get_telemetry()


@router.get("/channels")
async def get_channels():
    return grover_oracle_accelerator.get_channels()


@router.post("/accelerate-indexing")
async def accelerate_indexing(req: AccelerateIndexingRequest):
    return grover_oracle_accelerator.accelerate_indexing(
        channel_id=req.channel_id, target_queries=req.target_queries
    )
