from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.modave_attractor_dao import modave_attractor_dao

router = APIRouter(
    prefix="/api/finance/modave-attractor-dao", tags=["Modave Attractor DAO"]
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "FKS-CENTRAL-CHARGE-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 85.0


@router.get("/summary")
async def get_summary():
    return modave_attractor_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return modave_attractor_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return modave_attractor_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
