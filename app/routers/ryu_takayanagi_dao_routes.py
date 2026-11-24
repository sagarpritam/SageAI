from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.ryu_takayanagi_dao import ryu_takayanagi_dao

router = APIRouter(
    prefix="/api/finance/ryu-takayanagi-dao",
    tags=["Ryu-Takayanagi Extremal Surface DAO"],
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "RYU-TAKAYANAGI-MINIMAL-SURFACE-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 75.0


@router.get("/summary")
async def get_summary():
    return ryu_takayanagi_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return ryu_takayanagi_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return ryu_takayanagi_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
