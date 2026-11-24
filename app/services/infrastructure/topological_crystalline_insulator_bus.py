import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR,
    "artifacts",
    "infrastructure",
    "topological_crystalline_insulator_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "telemetry": {
                "bus_id": "TCI-SNTE-MIRROR-BUS-01",
                "crystal_structure": "ROCK_SALT_FMC3M_SNTE",
                "mirror_chern_number_nm": -2,
                "dirac_cones_count_per_surface": 4,
                "crystal_surface_plane": "{001}_AND_{110}",
                "bus_throughput_petabits_per_sec": 2400.0,
                "mirror_symmetry_protection_fidelity_percent": 99.99998,
                "status": "TOPOLOGICAL_SURFACE_BUS_OPTIMAL",
                "active_crystal_channels": 4,
            },
            "channels": [],
            "modulations": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class TopologicalCrystallineInsulatorBusService:
    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return ledger.get("telemetry", {})

    def get_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_mirror_symmetry(
        self, channel_id: str, strain_percent: float = 0.05
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        channels = ledger.get("channels", [])
        channel = next((c for c in channels if c.get("channel_id") == channel_id), None)
        if not channel and channels:
            channel = channels[0]

        mod_id = f"TCIB-MOD-{uuid.uuid4().hex[:8].upper()}"
        cone_shift = round(strain_percent * 0.04, 5)
        measured_vel = 520.0 + (strain_percent * 15.0)

        record = {
            "modulation_id": mod_id,
            "channel_id": channel.get("channel_id", channel_id)
            if channel
            else channel_id,
            "piezoelectric_strain_percent": strain_percent,
            "dirac_cone_shift_ev": cone_shift,
            "measured_velocity_km_s": measured_vel,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "MIRROR_SYMMETRY_MODULATED_LOCKED",
        }

        ledger.setdefault("modulations", []).insert(0, record)
        if channel:
            channel["dirac_velocity_km_s"] = measured_vel
            channel["status"] = "MIRROR_STRAIN_LOCKED"

        _save_ledger(ledger)
        return record


tci_bus_service = TopologicalCrystallineInsulatorBusService()
