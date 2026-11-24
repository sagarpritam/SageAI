from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.scft_bootstrap_sentinel import scft_bootstrap_service

router = APIRouter(
    prefix="/api/security/scft-bootstrap", tags=["SCFT Conformal Bootstrap Sentinel"]
)


class SolveCrossingRequest(BaseModel):
    sector_id: str = "MINIMAL-ARGYRES-DOUGLAS"
    derivative_order: Optional[int] = 24


@router.get("/posture")
def get_posture() -> Dict[str, Any]:
    return scft_bootstrap_service.get_posture()


@router.get("/sectors")
def get_sectors() -> List[Dict[str, Any]]:
    return scft_bootstrap_service.get_sectors()


@router.post("/solve-crossing-bounds")
def solve_crossing_bounds(req: SolveCrossingRequest) -> Dict[str, Any]:
    return scft_bootstrap_service.solve_crossing_bounds(
        sector_id=req.sector_id, derivative_order=req.derivative_order or 24
    )
