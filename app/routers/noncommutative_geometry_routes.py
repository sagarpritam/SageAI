from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.noncommutative_geometry_sentinel import (
    noncommutative_geometry_service,
)

router = APIRouter(
    prefix="/api/security/noncommutative-geometry",
    tags=["Noncommutative Geometry Sentinel"],
)


class EvaluateSpectralActionRequest(BaseModel):
    manifold_id: str = "NCGS-MANIFOLD-CONNES-SM"
    cutoff_scale_gev: Optional[float] = 1.0e16


@router.get("/posture")
def get_posture() -> Dict[str, Any]:
    return noncommutative_geometry_service.get_posture()


@router.get("/manifolds")
def get_manifolds() -> List[Dict[str, Any]]:
    return noncommutative_geometry_service.get_manifolds()


@router.post("/evaluate-spectral-action")
def evaluate_spectral_action(req: EvaluateSpectralActionRequest) -> Dict[str, Any]:
    return noncommutative_geometry_service.evaluate_spectral_action(
        manifold_id=req.manifold_id, cutoff_scale_gev=req.cutoff_scale_gev or 1.0e16
    )
