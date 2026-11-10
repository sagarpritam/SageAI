"""
FastAPI Router for Capability 109: Topological K-Theory D-Brane Classifier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ktheory_dbrane.ktheory_dbrane import (
    get_ktheory_dbrane_classifier,
)

router = APIRouter(
    prefix="/api/ktheory-dbrane",
    tags=["Capability 109: Topological K-Theory D-Brane Classifier"],
)


class ClassifyChargeRequest(BaseModel):
    cycle_id: str = Field(..., description="ID of the K-theory topological cycle")
    chern_character_rank: int = Field(
        default=8,
        ge=2,
        le=32,
        description="Chern character virtual bundle rank",
    )
    torsion_order_n: int = Field(
        default=4,
        ge=1,
        le=16,
        description="Cyclic torsion order N for Z_N K-theory class",
    )
    anomaly_damping_gain: float = Field(
        default=1.12,
        ge=0.8,
        le=2.5,
        description="Freed-Witten anomaly damping gain",
    )


@router.get("/cycles")
async def list_cycles():
    """List all registered K-theory D-brane cycles."""
    classifier = get_ktheory_dbrane_classifier()
    return {"cycles": classifier.get_cycles()}


@router.post("/classify-charge")
async def classify_charge_route(request: ClassifyChargeRequest):
    """Classify RR D-brane charges in twisted K_H(X) and verify Freed-Witten cancellation."""
    classifier = get_ktheory_dbrane_classifier()
    try:
        return classifier.classify_charge(
            cycle_id=request.cycle_id,
            chern_character_rank=request.chern_character_rank,
            torsion_order_n=request.torsion_order_n,
            anomaly_damping_gain=request.anomaly_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_ktheory_metrics():
    """Retrieve aggregate K-theory D-brane classifier metrics."""
    classifier = get_ktheory_dbrane_classifier()
    return classifier.get_ktheory_metrics()
