from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.bec_dark_energy_dao import bec_dark_energy_service

router = APIRouter(
    prefix="/api/finance/bec-dark-energy",
    tags=["Bose-Einstein Condensate Dark Energy DAO"],
)


class StakeSuperfluidRequest(BaseModel):
    vault_id: str = "FUZZY-AXION-SOLITON-CORE"
    stake_volume_quadrillion_usd: Optional[float] = 30.0


@router.get("/summary")
def get_summary() -> Dict[str, Any]:
    return bec_dark_energy_service.get_summary()


@router.get("/vaults")
def get_vaults() -> List[Dict[str, Any]]:
    return bec_dark_energy_service.get_vaults()


@router.post("/stake")
def stake_superfluid(req: StakeSuperfluidRequest) -> Dict[str, Any]:
    return bec_dark_energy_service.stake_capital(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 30.0,
    )
