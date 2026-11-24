from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.hawking_evaporation_dao import hawking_evaporation_dao

router = APIRouter(
    prefix="/api/finance/hawking-evaporation-dao", tags=["Hawking Evaporation DAO"]
)


class StakeRequest(BaseModel):
    vault_id: Optional[str] = "HAWKING-TEMPERATURE-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 65.0


@router.get("/summary")
async def get_summary():
    return hawking_evaporation_dao.get_summary()


@router.get("/vaults")
async def get_vaults():
    return hawking_evaporation_dao.get_vaults()


@router.post("/stake")
async def stake(req: StakeRequest):
    return hawking_evaporation_dao.stake(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd,
    )
