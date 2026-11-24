from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.finance.cosmic_neutrino_relic_dao import cosmic_neutrino_relic_service

router = APIRouter(
    prefix="/api/finance/cosmic-neutrino-relic", tags=["Cosmic Neutrino Relic DAO"]
)


class StakeRelicRequest(BaseModel):
    vault_id: str = "PRIMORDIAL-DECOUPLING-1S"
    stake_volume_quadrillion_usd: Optional[float] = 35.0


@router.get("/summary")
def get_summary() -> Dict[str, Any]:
    return cosmic_neutrino_relic_service.get_summary()


@router.get("/vaults")
def get_vaults() -> List[Dict[str, Any]]:
    return cosmic_neutrino_relic_service.get_vaults()


@router.post("/stake")
def stake_relic_capital(req: StakeRelicRequest) -> Dict[str, Any]:
    return cosmic_neutrino_relic_service.stake_capital(
        vault_id=req.vault_id,
        stake_volume_quadrillion_usd=req.stake_volume_quadrillion_usd or 35.0,
    )
