from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.casimir_polder_sentinel import casimir_polder_service

router = APIRouter(
    prefix="/api/security/casimir-polder-sentinel", tags=["Casimir-Polder Sentinel"]
)


class DispersionAuditRequest(BaseModel):
    sector_id: str = "CASIMIR-POLDER-POTENTIAL-CORE"
    probe_separation_nm: Optional[float] = 1.2


@router.get("/posture")
def get_casimir_polder_posture():
    return casimir_polder_service.get_posture()


@router.get("/sectors")
def get_casimir_polder_sectors():
    return casimir_polder_service.list_sectors()


@router.post("/audit-dispersion-force")
def audit_dispersion_force(req: DispersionAuditRequest):
    return casimir_polder_service.audit_dispersion_force(
        sector_id=req.sector_id, probe_separation_nm=req.probe_separation_nm or 1.2
    )
