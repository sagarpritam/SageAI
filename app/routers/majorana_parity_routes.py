from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.majorana_parity_sentinel import majorana_parity_sentinel

router = APIRouter(
    prefix="/api/security/majorana-parity-sentinel", tags=["Majorana Parity Sentinel"]
)


class VerifyParityRequest(BaseModel):
    sector_id: Optional[str] = "KITAEV-CHAIN-ZERO-MODE-ALPHA"
    test_cycles: Optional[int] = 1000


@router.get("/posture")
async def get_posture():
    return majorana_parity_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return majorana_parity_sentinel.get_sectors()


@router.post("/verify-parity")
async def verify_parity(req: VerifyParityRequest):
    return majorana_parity_sentinel.verify_parity(
        sector_id=req.sector_id, test_cycles=req.test_cycles
    )
