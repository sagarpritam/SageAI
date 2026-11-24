from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.wald_entropy_sentinel import wald_entropy_service

router = APIRouter(
    prefix="/api/security/wald-entropy-sentinel", tags=["Wald Entropy Sentinel"]
)


class NoetherAuditRequest(BaseModel):
    sector_id: str = "WALD-NOETHER-2FORM-CORE"
    bifurcation_radius_m: Optional[float] = 1.0


@router.get("/posture")
def get_wald_entropy_posture():
    return wald_entropy_service.get_posture()


@router.get("/sectors")
def get_wald_entropy_sectors():
    return wald_entropy_service.list_sectors()


@router.post("/audit-noether-charge")
def audit_noether_charge(req: NoetherAuditRequest):
    return wald_entropy_service.audit_noether_charge(
        sector_id=req.sector_id, bifurcation_radius_m=req.bifurcation_radius_m or 1.0
    )
