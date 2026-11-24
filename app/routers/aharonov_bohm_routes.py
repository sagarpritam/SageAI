from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.aharonov_bohm_sentinel import aharonov_bohm_sentinel

router = APIRouter(
    prefix="/api/security/aharonov-bohm-sentinel", tags=["Aharonov-Bohm Sentinel"]
)


class AuditGaugePhaseRequest(BaseModel):
    sector_id: Optional[str] = "AHARONOV-BOHM-SOLENOID-CORE"
    enclosed_flux_webers: Optional[float] = 2.07e-15


@router.get("/posture")
async def get_posture():
    return aharonov_bohm_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return aharonov_bohm_sentinel.get_sectors()


@router.post("/audit-gauge-phase")
async def audit_gauge_phase(req: AuditGaugePhaseRequest):
    return aharonov_bohm_sentinel.audit_gauge_phase(
        sector_id=req.sector_id, enclosed_flux_webers=req.enclosed_flux_webers
    )
