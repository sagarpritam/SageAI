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
    "wrt_tqft_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "dao_id": "WRT-TQFT-DAO-01",
            "dao_name": "Witten-Reshetikhin-Turaev 3D TQFT Quantum Invariant Yield DAO",
            "status": "ARBITRAGE_ACTIVE",
            "total_staked_wrt_capital_quadrillion_usd": 2100.0,
            "projected_annualized_yield_percent": 74.5,
            "dehn_surgery_invariance_percent": 99.9999999,
            "active_wrt_vaults": 4,
            "vaults": [],
            "stakes": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class WrtTqftQuantumDaoService:
    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "dao_id": ledger.get("dao_id", "WRT-TQFT-DAO-01"),
            "dao_name": ledger.get(
                "dao_name",
                "Witten-Reshetikhin-Turaev 3D TQFT Quantum Invariant Yield DAO",
            ),
            "status": ledger.get("status", "ARBITRAGE_ACTIVE"),
            "total_staked_wrt_capital_quadrillion_usd": ledger.get(
                "total_staked_wrt_capital_quadrillion_usd", 2100.0
            ),
            "projected_annualized_yield_percent": ledger.get(
                "projected_annualized_yield_percent", 74.5
            ),
            "dehn_surgery_invariance_percent": ledger.get(
                "dehn_surgery_invariance_percent", 99.9999999
            ),
            "active_wrt_vaults": len(ledger.get("vaults", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_wrt(
        self,
        vault_id: str = "WRT-CHERN-SIMONS-CORE",
        stake_amount_quadrillion_usd: float = 50.0,
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        vaults = ledger.get("vaults", [])

        target_vault = None
        for v in vaults:
            if v.get("vault_id") == vault_id:
                target_vault = v
                break

        current_total = ledger.get("total_staked_wrt_capital_quadrillion_usd", 2100.0)
        new_total = round(current_total + stake_amount_quadrillion_usd, 2)
        ledger["total_staked_wrt_capital_quadrillion_usd"] = new_total

        if target_vault:
            current_vault_staked = target_vault.get(
                "staked_capital_quadrillion_usd", 850.0
            )
            target_vault["staked_capital_quadrillion_usd"] = round(
                current_vault_staked + stake_amount_quadrillion_usd, 2
            )
            target_vault["status"] = "ACTIVE"

        stake_entry = {
            "stake_id": f"WRT-STAKE-{uuid.uuid4().hex[:8].upper()}",
            "vault_id": vault_id,
            "staked_volume_quadrillion_usd": stake_amount_quadrillion_usd,
            "total_staked_wrt_capital_quadrillion_usd": new_total,
            "projected_yield_apy_percent": target_vault.get(
                "projected_yield_apy_percent", 75.2
            )
            if target_vault
            else 74.5,
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

    def stake_capital(
        self,
        vault_id: str = "WRT-CHERN-SIMONS-CORE",
        stake_amount_quadrillion_usd: float = 50.0,
    ) -> Dict[str, Any]:
        return self.stake_wrt(vault_id, stake_amount_quadrillion_usd)


wrt_tqft_service = WrtTqftQuantumDaoService()
