from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.holo_screening_dao import holo_screening_dao

router = APIRouter(
    prefix="/api/finance/holo-screening-dao", tags=["Holo-Screening DAO"]
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "VERLINDE-ENTROPIC-FORCE-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 70.0


@router.get("/summary")
async def get_summary():
    return holo_screening_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return holo_screening_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return holo_screening_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
