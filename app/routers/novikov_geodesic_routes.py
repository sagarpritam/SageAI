from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.novikov_geodesic_normalizer import get_novikov_geodesic_normalizer

router = APIRouter(
    prefix="/api/novikov-geodesic",
    tags=["Chrono-Topological Novikov Self-Consistency Geodesic Loop Normalizer (Cap 97)"],
)


class NormalizeLoopRequest(BaseModel):
    loop_id: str = Field(..., description="Target closed timelike curve / geodesic loop ID")
    phase_adjustment_gain: float = Field(default=1.0, ge=0.1, le=10.0, description="Path integral phase adjustment gain")


@router.get("/loops")
async def get_loops() -> List[Dict[str, Any]]:
    norm = get_novikov_geodesic_normalizer()
    return norm.list_loops()


@router.post("/normalize-loop")
async def normalize_loop(req: NormalizeLoopRequest) -> Dict[str, Any]:
    try:
        norm = get_novikov_geodesic_normalizer()
        return norm.normalize_geodesic_loop(
            loop_id=req.loop_id,
            phase_adjustment_gain=req.phase_adjustment_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    norm = get_novikov_geodesic_normalizer()
    return norm.get_normalizer_metrics()
