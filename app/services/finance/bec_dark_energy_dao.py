import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "finance", "bec_dark_energy_ledger.json"
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "summary": {
                "dao_id": "BECDE-AXION-SUPERFLUID-01",
                "ultra_light_axion_mass_ev": 1.0e-22,
                "jeans_scale_astronomical_kpc": 1.4,
                "gross_pitaevskii_quantum_pressure_ratio": 1.0,
                "dark_energy_equation_of_state_w": -1.0,
                "total_staked_superfluid_capital_quadrillion_usd": 750.0,
                "projected_annualized_yield_percent": 29.5,
                "status": "MACROSCOPIC_BEC_SUPERFLUID_OPTIMAL",
                "active_condensate_vaults": 4,
            },
            "vaults": [],
            "stakes": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class BECDarkEnergyDaoService:
    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return ledger.get("summary", {})

    def get_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_capital(
        self, vault_id: str, stake_volume_quadrillion_usd: float = 30.0
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        vaults = ledger.get("vaults", [])
        vault = next((v for v in vaults if v.get("vault_id") == vault_id), None)
        if not vault and vaults:
            vault = vaults[0]

        stake_id = f"BECDE-STAKE-{uuid.uuid4().hex[:8].upper()}"
        cur_staked = (
            vault.get("staked_capital_quadrillion_usd", 200.0) if vault else 200.0
        )
        new_vault_total = cur_staked + stake_volume_quadrillion_usd

        record = {
            "stake_id": stake_id,
            "vault_id": vault.get("vault_id", vault_id) if vault else vault_id,
            "staked_volume_quadrillion_usd": stake_volume_quadrillion_usd,
            "vault_total_staked_quadrillion_usd": new_vault_total,
            "accrued_superfluid_yield_apy": vault.get("target_annual_yield_apy", 29.5)
            if vault
            else 29.5,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "SUPERFLUID_CAPITAL_STAKED",
        }

        ledger.setdefault("stakes", []).insert(0, record)
        if vault:
            vault["staked_capital_quadrillion_usd"] = new_vault_total

        summary = ledger.setdefault("summary", {})
        summary["total_staked_superfluid_capital_quadrillion_usd"] = round(
            summary.get("total_staked_superfluid_capital_quadrillion_usd", 750.0)
            + stake_volume_quadrillion_usd,
            2,
        )

        _save_ledger(ledger)
        return record


bec_dark_energy_service = BECDarkEnergyDaoService()
