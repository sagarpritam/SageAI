import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "infrastructure", "quantum_spin_liquid_ledger.json"
)


class QuantumSpinLiquidBackboneService:
    def __init__(self, ledger_path: str = LEDGER_PATH):
        self.ledger_path = ledger_path
        self._ensure_ledger()

    def _ensure_ledger(self) -> None:
        if not os.path.exists(self.ledger_path):
            os.makedirs(os.path.dirname(self.ledger_path), exist_ok=True)
            default_data = {
                "telemetry": {
                    "backbone_id": "QSLB-KITAEV-MAJORANA-01",
                    "lattice_symmetry": "HONEYCOMB_C3V_CHIRAL",
                    "kitaev_coupling_k_mev": 8.5,
                    "thermal_hall_conductance_half_integer": 0.5,
                    "vison_flux_gap_kelvin": 12.4,
                    "network_throughput_petabits_per_sec": 2000.0,
                    "topological_braiding_fidelity_percent": 99.99998,
                    "status": "MAJORANA_EDGE_RIBBON_ACTIVE",
                    "active_ribbon_channels": 4,
                },
                "ribbons": [
                    {
                        "ribbon_id": "QSLB-RIBBON-KITAEV-ALPHA",
                        "material_phase": "ALPHA_RUCL3_HONEYCOMB",
                        "majorana_velocity_km_s": 380.0,
                        "flux_vortices_count": 16,
                        "chiral_edge_width_nm": 4.5,
                        "status": "FRACTIONALIZED_CHIRAL_LOCKED",
                    },
                    {
                        "ribbon_id": "QSLB-RIBBON-Z2-VISON-BETA",
                        "material_phase": "NA2IRO3_HEAVY_ELEMENT",
                        "majorana_velocity_km_s": 410.0,
                        "flux_vortices_count": 24,
                        "chiral_edge_width_nm": 5.2,
                        "status": "Z2_GAUGE_FLUX_PINNED",
                    },
                    {
                        "ribbon_id": "QSLB-RIBBON-CHIRAL-EDGE-GAMMA",
                        "material_phase": "TORIC_CODE_ANALOG_2D",
                        "majorana_velocity_km_s": 450.0,
                        "flux_vortices_count": 32,
                        "chiral_edge_width_nm": 3.8,
                        "status": "THERMAL_HALL_HALF_QUANTIZED",
                    },
                    {
                        "ribbon_id": "QSLB-RIBBON-TORIC-DELTA",
                        "material_phase": "H3LIIRO6_INTERCALATED",
                        "majorana_velocity_km_s": 360.0,
                        "flux_vortices_count": 12,
                        "chiral_edge_width_nm": 6.0,
                        "status": "SPIN_LIQUID_PROTECTED",
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

    def get_telemetry(self) -> Dict[str, Any]:
        data = self._read_ledger()
        return data.get("telemetry", {})

    def get_ribbons(self) -> List[Dict[str, Any]]:
        data = self._read_ledger()
        return data.get("ribbons", [])

    def tune_vortex(
        self, ribbon_id: str, flux_quantum_bias: float = 0.5
    ) -> Dict[str, Any]:
        data = self._read_ledger()
        ribbons = data.get("ribbons", [])
        matched = None
        for r in ribbons:
            if r["ribbon_id"] == ribbon_id:
                r["flux_vortices_count"] = r.get("flux_vortices_count", 16) + 4
                matched = r
                break

        if not matched:
            matched = {
                "ribbon_id": ribbon_id,
                "material_phase": "DYNAMIC_KITAEV_RIBBON",
                "majorana_velocity_km_s": 400.0,
                "flux_vortices_count": 20,
                "chiral_edge_width_nm": 5.0,
                "status": "DYNAMIC_MAJORANA_PINNED",
            }
            ribbons.append(matched)

        receipt = {
            "tuning_id": f"QSLB-TUNE-{uuid.uuid4().hex[:8].upper()}",
            "ribbon_id": ribbon_id,
            "flux_quantum_bias": flux_quantum_bias,
            "flux_vortices_stabilized": matched["flux_vortices_count"],
            "edge_mode_velocity_km_s": matched["majorana_velocity_km_s"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "VISON_VORTEX_TUNED_LOCKED",
        }

        data.setdefault("history", []).append(receipt)
        self._write_ledger(data)
        return receipt


quantum_spin_liquid_service = QuantumSpinLiquidBackboneService()
