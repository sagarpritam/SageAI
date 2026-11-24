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
    "drinfeld_center_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "dao_id": "DRINFELD-CENTER-DAO-01",
            "dao_name": "Drinfeld Center Modular Tensor Category DAO",
            "status": "ARBITRAGE_ACTIVE",
            "total_staked_drinfeld_capital_quadrillion_usd": 1800.0,
            "projected_annualized_yield_percent": 67.5,
            "s_matrix_unitarity_percent": 99.99999,
            "active_drinfeld_vaults": 4,
            "vaults": [],
            "stakes": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class DrinfeldCenterDaoService:
    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "dao_id": ledger.get("dao_id", "DRINFELD-CENTER-DAO-01"),
            "dao_name": ledger.get(
                "dao_name",
                "Drinfeld Center Modular Tensor Category DAO",
            ),
            "status": ledger.get("status", "ARBITRAGE_ACTIVE"),
            "total_staked_drinfeld_capital_quadrillion_usd": ledger.get(
                "total_staked_drinfeld_capital_quadrillion_usd", 1800.0
            ),
            "projected_annualized_yield_percent": ledger.get(
                "projected_annualized_yield_percent", 67.5
            ),
            "s_matrix_unitarity_percent": ledger.get(
                "s_matrix_unitarity_percent", 99.99999
            ),
            "active_drinfeld_vaults": len(ledger.get("vaults", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_capital(
        self,
        vault_id: str = "DRINFELD-CENTER-ALPHA",
        stake_amount_quadrillion_usd: float = 50.0,
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        vaults = ledger.get("vaults", [])

        target_vault = None
        for v in vaults:
            if v.get("vault_id") == vault_id:
                target_vault = v
                break

        current_total = ledger.get(
            "total_staked_drinfeld_capital_quadrillion_usd", 1800.0
        )
        new_total = round(current_total + stake_amount_quadrillion_usd, 2)
        ledger["total_staked_drinfeld_capital_quadrillion_usd"] = new_total

        if target_vault:
            current_vault_staked = target_vault.get(
                "staked_capital_quadrillion_usd", 750.0
            )
            target_vault["staked_capital_quadrillion_usd"] = round(
                current_vault_staked + stake_amount_quadrillion_usd, 2
            )
            target_vault["status"] = "ACTIVE"

        stake_entry = {
            "stake_id": f"DRINFELD-STAKE-{uuid.uuid4().hex[:8].upper()}",
            "vault_id": vault_id,
            "staked_volume_quadrillion_usd": stake_amount_quadrillion_usd,
            "total_staked_drinfeld_capital_quadrillion_usd": new_total,
            "projected_yield_apy_percent": target_vault.get(
                "projected_yield_apy_percent", 68.0
            )
            if target_vault
            else 67.5,
            "status": "CAPITAL_STAKED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        stakes = ledger.get("stakes", [])
        stakes.insert(0, stake_entry)
        ledger["stakes"] = stakes[:50]
        ledger["vaults"] = vaults
        ledger["status"] = "ARBITRAGE_ACTIVE"

        _save_ledger(ledger)
        return stake_entry

    def list_vaults(self) -> List[Dict[str, Any]]:
        return self.get_vaults()


drinfeld_center_service = DrinfeldCenterDaoService()
