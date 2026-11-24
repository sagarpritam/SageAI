import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "finance", "pbh_cluster_merger_ledger.json"
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "summary": {
                "dao_id": "PBHM-CLUSTER-MERGER-01",
                "cluster_number_density_pc3": 1.5e4,
                "qcd_transition_horizon_mass_msun": 1.0,
                "sub_solar_mass_fraction_fpbh": 0.08,
                "merger_rate_per_gpc3_yr": 4.2e3,
                "total_staked_merger_capital_quadrillion_usd": 850.0,
                "projected_annualized_yield_percent": 32.5,
                "status": "PBH_MERGER_CLUSTER_YIELD_OPTIMAL",
                "active_merger_vaults": 4,
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


class PBHClusterMergerDaoService:
    def get_summary(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return ledger.get("summary", {})

    def get_vaults(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("vaults", [])

    def stake_capital(
        self, vault_id: str, stake_volume_quadrillion_usd: float = 40.0
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        vaults = ledger.get("vaults", [])
        vault = next((v for v in vaults if v.get("vault_id") == vault_id), None)
        if not vault and vaults:
            vault = vaults[0]

        stake_id = f"PBHM-STAKE-{uuid.uuid4().hex[:8].upper()}"
        cur_staked = (
            vault.get("staked_capital_quadrillion_usd", 220.0) if vault else 220.0
        )
        new_vault_total = cur_staked + stake_volume_quadrillion_usd

        record = {
            "stake_id": stake_id,
            "vault_id": vault.get("vault_id", vault_id) if vault else vault_id,
            "staked_volume_quadrillion_usd": stake_volume_quadrillion_usd,
            "vault_total_staked_quadrillion_usd": new_vault_total,
            "accrued_merger_yield_apy": vault.get("target_annual_yield_apy", 32.5)
            if vault
            else 32.5,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "PBH_MERGER_CAPITAL_STAKED",
        }

        ledger.setdefault("stakes", []).insert(0, record)
        if vault:
            vault["staked_capital_quadrillion_usd"] = new_vault_total

        summary = ledger.setdefault("summary", {})
        summary["total_staked_merger_capital_quadrillion_usd"] = round(
            summary.get("total_staked_merger_capital_quadrillion_usd", 850.0)
            + stake_volume_quadrillion_usd,
            2,
        )

        _save_ledger(ledger)
        return record


pbh_cluster_merger_service = PBHClusterMergerDaoService()
