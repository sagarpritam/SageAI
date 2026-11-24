from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.fqhe_anyonic_sentinel import fqhe_anyonic_sentinel

router = APIRouter(
    prefix="/api/security/fqhe-anyonic-sentinel", tags=["FQHE Anyonic Sentinel"]
)


class AuditAnyonicBraidRequest(BaseModel):
    sector_id: Optional[str] = "LAUGHLIN-QUASIPARTICLE-CORE"
    braid_operations: Optional[int] = 16


@router.get("/posture")
async def get_posture():
    return fqhe_anyonic_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return fqhe_anyonic_sentinel.get_sectors()


@router.post("/audit-anyonic-braid")
async def audit_anyonic_braid(req: AuditAnyonicBraidRequest):
    return fqhe_anyonic_sentinel.audit_anyonic_braid(
        sector_id=req.sector_id, braid_operations=req.braid_operations
    )
