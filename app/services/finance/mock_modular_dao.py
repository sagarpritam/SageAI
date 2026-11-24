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
    "mock_modular_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "dao_id": "MOCK-MODULAR-DAO-01",
            "dao_name": "Dabholkar-Gopakumar-Murthy Non-Holomorphic Mock Modular Form Arbitrage DAO",
            "status": "ARBITRAGE_ACTIVE",
            "total_staked_mock_modular_capital_quadrillion_usd": 1400.0,
            "projected_annualized_yield_percent": 54.0,
            "mock_shadow_convergence_percent": 99.999,
            "active_mock_modular_vaults": 4,
            "vaults": [],
            "stake_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class MockModularDAOService:
    def __init__(self) -> None:
        pass

    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "dao_id": ledger.get("dao_id", "MOCK-MODULAR-DAO-01"),
            "dao_name": ledger.get(
                "dao_name",
                "Dabholkar-Gopakumar-Murthy Non-Holomorphic Mock Modular Form Arbitrage DAO",
            ),
            "status": ledger.get("status", "ARBITRAGE_ACTIVE"),
            "total_staked_mock_modular_capital_quadrillion_usd": ledger.get(
                "total_staked_mock_modular_capital_quadrillion_usd", 1400.0
            ),
            "projected_annualized_yield_percent": ledger.get(
                "projected_annualized_yield_percent", 54.0
            ),
            "mock_shadow_convergence_percent": ledger.get(
                "mock_shadow_convergence_percent", 99.999
            ),
            "active_mock_modular_vaults": len(ledger.get("vaults", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_mock_modular(
        self, vault_id: str, stake_volume_quadrillion_usd: float
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        vaults = ledger.get("vaults", [])

        target_vault = None
        for vt in vaults:
            if vt.get("vault_id") == vault_id:
                target_vault = vt
                break

        if not target_vault and vaults:
            target_vault = vaults[0]
            vault_id = target_vault.get("vault_id", "DGM-MOCK-MODULAR-CORE")

        added_capital = round(abs(stake_volume_quadrillion_usd), 2)
        if target_vault:
            target_vault["allocated_capital_quadrillion_usd"] = round(
                target_vault.get("allocated_capital_quadrillion_usd", 0.0)
                + added_capital,
                2,
            )
            target_vault["status"] = "STAKE_EXPANDED_MOCK_MODULAR"

        total_capital = round(
            ledger.get("total_staked_mock_modular_capital_quadrillion_usd", 1400.0)
            + added_capital,
            2,
        )
        ledger["total_staked_mock_modular_capital_quadrillion_usd"] = total_capital

        stake_record = {
            "stake_id": f"MOCK-STAKE-{uuid.uuid4().hex[:8].upper()}",
            "vault_id": vault_id,
            "staked_volume_quadrillion_usd": added_capital,
            "total_staked_mock_modular_capital_quadrillion_usd": total_capital,
            "projected_yield_apy_percent": 54.0,
            "status": "STAKED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("stake_history", [])
        history.append(stake_record)
        ledger["stake_history"] = history[-50:]
        _save_ledger(ledger)

        return stake_record


mock_modular_service = MockModularDAOService()
