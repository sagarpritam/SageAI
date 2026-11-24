from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.swampland_cobordism_dao import swampland_cobordism_dao

router = APIRouter(
    prefix="/api/finance/swampland-cobordism-dao", tags=["Swampland Cobordism DAO"]
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "COBORDISM-VANISHING-CLASS-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 80.0


@router.get("/summary")
async def get_summary():
    return swampland_cobordism_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return swampland_cobordism_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return swampland_cobordism_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
