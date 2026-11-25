"""
FastAPI router for Capability 183: Deligne-Lusztig Character Sheaves Barrier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.deligne_lusztig_character_barrier import (
    get_deligne_lusztig_character_barrier_service,
)

router = APIRouter(
    prefix="/api/deligne-lusztig-character",
    tags=["Deligne-Lusztig Character Barrier"],
)


class EvaluateCharacterRequest(BaseModel):
    variety_id: str = Field(..., description="ID of the Deligne-Lusztig variety")
    cohomology_degree: int = Field(
        default=2, ge=0, le=12, description="Compactly supported étale cohomology degree"
    )
    unipotent_rank: int = Field(
        default=3, ge=1, le=8, description="Unipotent character representation rank"
    )
    representation_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Representation orthogonality gain"
    )


@router.get("/varieties")
async def list_deligne_lusztig_varieties():
    """List registered Deligne-Lusztig varieties."""
    svc = get_deligne_lusztig_character_barrier_service()
    return {"varieties": svc.get_varieties()}


@router.post("/evaluate-character")
async def evaluate_character(request: EvaluateCharacterRequest):
    """Evaluate Deligne-Lusztig virtual character and Green functions."""
    svc = get_deligne_lusztig_character_barrier_service()
    try:
        return svc.evaluate_character(
            variety_id=request.variety_id,
            cohomology_degree=request.cohomology_degree,
            unipotent_rank=request.unipotent_rank,
            representation_gain=request.representation_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_character_barrier_metrics():
    """Get operational telemetry metrics for Deligne-Lusztig character barrier."""
    svc = get_deligne_lusztig_character_barrier_service()
    return svc.get_metrics()
