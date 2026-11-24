import json
import os
import uuid
from typing import Any, Dict, List


class SpinorBecBus:
    def __init__(self):
        self.root_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        self.ledger_path = os.path.join(
            self.root_dir, "artifacts", "infrastructure", "spinor_bec_ledger.json"
        )

    def _load_ledger(self) -> Dict[str, Any]:
        if os.path.exists(self.ledger_path):
            with open(self.ledger_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "bus_id": "SPINOR-BEC-BUS-01",
            "spinor_manifold": "SPIN_1_FERROMAGNETIC_BEC_SO3_BROKEN_SYMMETRY",
            "optical_bus_throughput_pbps": 5200.0,
            "spin_stiffness_nj_m": 2.45,
            "transverse_spin_fidelity_percent": 99.999999,
            "status": "SPINOR_BEC_MAGNON_BUS_ACTIVE",
            "active_magnon_channels": 4,
            "channels": [],
        }

    def get_telemetry(self) -> Dict[str, Any]:
        data = self._load_ledger()
        return {
            "bus_id": data.get("bus_id", "SPINOR-BEC-BUS-01"),
            "spinor_manifold": data.get(
                "spinor_manifold", "SPIN_1_FERROMAGNETIC_BEC_SO3_BROKEN_SYMMETRY"
            ),
            "optical_bus_throughput_pbps": data.get(
                "optical_bus_throughput_pbps", 5200.0
            ),
            "spin_stiffness_nj_m": data.get("spin_stiffness_nj_m", 2.45),
            "transverse_spin_fidelity_percent": data.get(
                "transverse_spin_fidelity_percent", 99.999999
            ),
            "status": data.get("status", "SPINOR_BEC_MAGNON_BUS_ACTIVE"),
            "active_magnon_channels": data.get("active_magnon_channels", 4),
        }

    def get_channels(self) -> List[Dict[str, Any]]:
        data = self._load_ledger()
        return data.get("channels", [])

    def modulate_magnon(
        self, channel_id: str = "SPINOR-FERRO-ALPHA", spin_stiffness_nj_m: float = 2.45
    ) -> Dict[str, Any]:
        modulation_id = f"SPINOR-MOD-{uuid.uuid4().hex[:8].upper()}"
        return {
            "modulation_id": modulation_id,
            "channel_id": channel_id,
            "spin_stiffness_nj_m": spin_stiffness_nj_m,
            "magnon_dispersion_ghz": 14.8,
            "optical_throughput_pbps": 1300.0,
            "timestamp": "2026-11-21T03:20:00Z",
            "status": "MAGNON_SPIN_WAVE_MODULATED",
        }


spinor_bec_bus = SpinorBecBus()
