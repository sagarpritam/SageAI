from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.penrose_process_dao import penrose_process_dao

router = APIRouter(
    prefix="/api/finance/penrose-process-dao", tags=["Penrose Process DAO"]
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "PENROSE-ERGOSPHERE-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 60.0


@router.get("/summary")
async def get_summary():
    return penrose_process_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return penrose_process_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return penrose_process_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
