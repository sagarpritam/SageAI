from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.supergravity_green_schwarz_sentinel import (
    supergravity_sentinel_service,
)

router = APIRouter(
    prefix="/api/security/supergravity-green-schwarz",
    tags=["Supergravity Green-Schwarz Sentinel"],
)


class CancelAnomalyRequest(BaseModel):
    manifold_id: str = "E8-XE8-HETEROTIC-STRING"
    differential_form_order: Optional[int] = 12


@router.get("/posture")
def get_posture() -> Dict[str, Any]:
    return supergravity_sentinel_service.get_posture()


@router.get("/manifolds")
def get_manifolds() -> List[Dict[str, Any]]:
    return supergravity_sentinel_service.get_manifolds()


@router.post("/cancel-anomaly-polynomial")
def cancel_anomaly_polynomial(req: CancelAnomalyRequest) -> Dict[str, Any]:
    return supergravity_sentinel_service.cancel_anomaly_polynomial(
        manifold_id=req.manifold_id,
        differential_form_order=req.differential_form_order or 12,
    )
