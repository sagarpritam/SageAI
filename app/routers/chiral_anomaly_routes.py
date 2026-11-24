from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.chiral_anomaly_dao import chiral_anomaly_service

router = APIRouter(
    prefix="/api/finance/chiral-anomaly-dao", tags=["Chiral Anomaly DAO"]
)


class ChiralStakeRequest(BaseModel):
    vault_id: str = "ABJ-TRIANGLE-ANOMALY-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 55.0


@router.get("/summary")
def get_chiral_anomaly_summary():
    return chiral_anomaly_service.get_summary()


@router.get("/vaults")
def get_chiral_anomaly_vaults():
    return chiral_anomaly_service.list_vaults()


@router.post("/stake")
def stake_axial_capital(req: ChiralStakeRequest):
    return chiral_anomaly_service.stake_axial_capital(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 55.0,
    )
