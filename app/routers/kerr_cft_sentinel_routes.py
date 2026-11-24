from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.kerr_cft_sentinel import kerr_cft_service

router = APIRouter(prefix="/api/security/kerr-cft-sentinel", tags=["Kerr CFT Sentinel"])


class StressTensorRequest(BaseModel):
    sector_id: str = "NHEK-ERGOREGION-STABILIZER"
    angular_momentum_quantum_m: Optional[int] = 2


@router.get("/posture")
def get_kerr_cft_posture():
    return kerr_cft_service.get_posture()


@router.get("/sectors")
def get_kerr_cft_sectors():
    return kerr_cft_service.list_sectors()


@router.post("/verify-dual-stress-tensor")
def verify_dual_stress_tensor(req: StressTensorRequest):
    return kerr_cft_service.verify_dual_stress_tensor(
        sector_id=req.sector_id,
        angular_momentum_quantum_m=req.angular_momentum_quantum_m or 2,
    )
