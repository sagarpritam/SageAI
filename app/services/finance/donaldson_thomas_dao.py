import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

LEDGER_PATH = os.path.join(
    os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ),
    "artifacts",
    "finance",
    "donaldson_thomas_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "dao_id": "DONALDSON-THOMAS-DAO-01",
            "dao_name": "Donaldson-Thomas Invariant & Cohomological Hall Algebra Arbitrage DAO",
            "status": "ARBITRAGE_ACTIVE",
            "total_staked_dt_capital_quadrillion_usd": 1600.0,
            "projected_annualized_yield_percent": 62.0,
            "wall_crossing_convergence_percent": 99.99999,
            "active_dt_vaults": 4,
            "vaults": [],
            "stakes": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class DonaldsonThomasDaoService:
    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "dao_id": ledger.get("dao_id", "DONALDSON-THOMAS-DAO-01"),
            "dao_name": ledger.get(
                "dao_name",
                "Donaldson-Thomas Invariant & Cohomological Hall Algebra Arbitrage DAO",
            ),
            "status": ledger.get("status", "ARBITRAGE_ACTIVE"),
            "total_staked_dt_capital_quadrillion_usd": ledger.get(
                "total_staked_dt_capital_quadrillion_usd", 1600.0
            ),
            "projected_annualized_yield_percent": ledger.get(
                "projected_annualized_yield_percent", 62.0
            ),
            "wall_crossing_convergence_percent": ledger.get(
                "wall_crossing_convergence_percent", 99.99999
            ),
            "active_dt_vaults": len(ledger.get("vaults", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_dt_capital(
        self, vault_id: str, stake_volume_quadrillion_usd: float
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        stake_id = f"DT-STAKE-{uuid.uuid4().hex[:8].upper()}"

        curr_total = ledger.get("total_staked_dt_capital_quadrillion_usd", 1600.0)
        new_total = round(curr_total + stake_volume_quadrillion_usd, 4)
        ledger["total_staked_dt_capital_quadrillion_usd"] = new_total

        vaults = ledger.get("vaults", [])
        for v in vaults:
            if v.get("vault_id") == vault_id:
                v["staked_capital_quadrillion_usd"] = round(
                    v.get("staked_capital_quadrillion_usd", 0.0)
                    + stake_volume_quadrillion_usd,
                    4,
                )
                break

        receipt = {
            "stake_id": stake_id,
            "vault_id": vault_id,
            "staked_volume_quadrillion_usd": stake_volume_quadrillion_usd,
            "total_staked_dt_capital_quadrillion_usd": new_total,
            "projected_yield_apy_percent": 62.0,
            "status": "STAKED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        stakes = ledger.get("stakes", [])
        stakes.append(receipt)
        ledger["stakes"] = stakes[-50:]
        ledger["last_updated"] = datetime.now(timezone.utc).isoformat()
        _save_ledger(ledger)

        return receipt


donaldson_thomas_service = DonaldsonThomasDaoService()

# Module-level aliases
get_dt_summary = donaldson_thomas_service.get_summary
get_dt_vaults = donaldson_thomas_service.list_vaults
stake_dt_capital = donaldson_thomas_service.stake_dt_capital
