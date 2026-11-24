import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "finance", "cosmic_inflation_tensor_ledger.json"
)


class CosmicInflationTensorDaoService:
    def __init__(self, ledger_path: str = LEDGER_PATH):
        self.ledger_path = ledger_path
        self._ensure_ledger()

    def _ensure_ledger(self) -> None:
        if not os.path.exists(self.ledger_path):
            os.makedirs(os.path.dirname(self.ledger_path), exist_ok=True)
            default_data = {
                "summary": {
                    "dao_id": "CITM-PRIMORDIAL-B-MODE-01",
                    "tensor_to_scalar_ratio_r": 0.024,
                    "tensor_spectral_index_n_t": -0.003,
                    "energy_scale_inflation_gev": 1.2e16,
                    "b_mode_lensing_subtraction_db": -32.5,
                    "total_staked_polarization_capital_quadrillion_usd": 700.0,
                    "projected_annualized_yield_percent": 28.0,
                    "status": "PRIMORDIAL_GRAVITATIONAL_DAO_OPTIMAL",
                    "active_polarization_vaults": 4,
                },
                "vaults": [
                    {
                        "vault_id": "CITM-VAULT-PRIMORDIAL-INFLATON",
                        "polarization_signature": "CMB_QUADRUPOLE_RECOMBINATION_PEAK",
                        "multipole_moment_l": 80,
                        "tensor_amplitude_uk2": 0.045,
                        "staked_capital_quadrillion_usd": 210.0,
                        "apy_percent": 28.5,
                        "status": "PRIMORDIAL_GW_YIELD_HARVESTING",
                    },
                    {
                        "vault_id": "CITM-VAULT-LENSING-CLEANSED",
                        "polarization_signature": "DELENSED_GRAVITATIONAL_CMB_MAP",
                        "multipole_moment_l": 500,
                        "tensor_amplitude_uk2": 0.012,
                        "staked_capital_quadrillion_usd": 185.0,
                        "apy_percent": 27.8,
                        "status": "E_TO_B_DEROTATION_ACTIVE",
                    },
                    {
                        "vault_id": "CITM-VAULT-REIONIZATION-BUMP",
                        "polarization_signature": "LARGE_ANGULAR_OPTICAL_DEPTH_TAU",
                        "multipole_moment_l": 6,
                        "tensor_amplitude_uk2": 0.088,
                        "staked_capital_quadrillion_usd": 160.0,
                        "apy_percent": 28.2,
                        "status": "OPTICAL_DEPTH_ACCRETING",
                    },
                    {
                        "vault_id": "CITM-VAULT-SPECTRAL-RUNNING",
                        "polarization_signature": "SECOND_ORDER_SLOW_ROLL_PARAM_XI",
                        "multipole_moment_l": 120,
                        "tensor_amplitude_uk2": 0.031,
                        "staked_capital_quadrillion_usd": 145.0,
                        "apy_percent": 27.5,
                        "status": "INFLATON_POTENTIAL_ACCRETING",
                    },
                ],
                "history": [],
            }
            with open(self.ledger_path, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2)

    def _read_ledger(self) -> Dict[str, Any]:
        with open(self.ledger_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write_ledger(self, data: Dict[str, Any]) -> None:
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_summary(self) -> Dict[str, Any]:
        data = self._read_ledger()
        return data.get("summary", {})

    def get_vaults(self) -> List[Dict[str, Any]]:
        data = self._read_ledger()
        return data.get("vaults", [])

    def stake(
        self, vault_id: str, stake_volume_quadrillion_usd: float = 25.0
    ) -> Dict[str, Any]:
        data = self._read_ledger()
        vaults = data.get("vaults", [])
        matched = None
        for v in vaults:
            if v["vault_id"] == vault_id:
                v["staked_capital_quadrillion_usd"] = round(
                    v["staked_capital_quadrillion_usd"] + stake_volume_quadrillion_usd,
                    2,
                )
                matched = v
                break

        if not matched:
            matched = {
                "vault_id": vault_id,
                "polarization_signature": "DYNAMIC_INFLATIONARY_POLARIZATION",
                "multipole_moment_l": 100,
                "tensor_amplitude_uk2": 0.035,
                "staked_capital_quadrillion_usd": stake_volume_quadrillion_usd,
                "apy_percent": 28.0,
                "status": "DYNAMIC_POLARIZATION_ACTIVE",
            }
            vaults.append(matched)

        summary = data.setdefault("summary", {})
        summary["total_staked_polarization_capital_quadrillion_usd"] = round(
            summary.get("total_staked_polarization_capital_quadrillion_usd", 700.0)
            + stake_volume_quadrillion_usd,
            2,
        )

        receipt = {
            "stake_id": f"CITM-STAKE-{uuid.uuid4().hex[:8].upper()}",
            "vault_id": vault_id,
            "staked_volume_quadrillion_usd": stake_volume_quadrillion_usd,
            "vault_total_staked_quadrillion_usd": matched[
                "staked_capital_quadrillion_usd"
            ],
            "accrued_tensor_yield_apy": matched["apy_percent"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "POLARIZATION_CAPITAL_STAKED",
        }

        data.setdefault("history", []).append(receipt)
        self._write_ledger(data)
        return receipt


cosmic_inflation_tensor_service = CosmicInflationTensorDaoService()
