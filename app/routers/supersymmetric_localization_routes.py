from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.supersymmetric_localization_sentinel import (
    susy_localization_service,
)

router = APIRouter(
    prefix="/api/security/supersymmetric-localization",
    tags=["Supersymmetric Localization Sentinel"],
)


class EvaluatePartitionRequest(BaseModel):
    sector_id: str = "PESTUN-S4-LOCALIZATION"
    gauge_coupling_g: Optional[float] = 0.5


@router.get("/posture")
def get_posture() -> Dict[str, Any]:
    return susy_localization_service.get_posture()


@router.get("/sectors")
def get_sectors() -> List[Dict[str, Any]]:
    return susy_localization_service.get_sectors()


@router.post("/evaluate-partition-function")
def evaluate_partition_function(req: EvaluatePartitionRequest) -> Dict[str, Any]:
    return susy_localization_service.evaluate_partition_function(
        sector_id=req.sector_id, gauge_coupling_g=req.gauge_coupling_g or 0.5
    )
