from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.hawking_area_dao import hawking_area_service

router = APIRouter(prefix="/api/finance/hawking-area-dao", tags=["Hawking Area DAO"])


class HorizonStakeRequest(BaseModel):
    vault_id: str = "IRREVERSIBLE-HORIZON-GROWTH"
    stake_volume_quadrillion_usd: Optional[float] = 45.0


@router.get("/summary")
def get_hawking_area_summary():
    return hawking_area_service.get_summary()


@router.get("/vaults")
def get_hawking_area_vaults():
    return hawking_area_service.list_vaults()


@router.post("/stake")
def stake_horizon_capital(req: HorizonStakeRequest):
    return hawking_area_service.stake_horizon_capital(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 45.0,
    )
