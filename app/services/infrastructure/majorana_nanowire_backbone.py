import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "infrastructure", "majorana_nanowire_ledger.json"
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "telemetry": {
                "backbone_id": "MZM-NANOWIRE-SHUTTLE-01",
                "semiconductor_core": "EPITAXIAL_INAS_RASHBA",
                "superconducting_shell": "PROXIMATE_EPITAXIAL_AL",
                "rashba_spin_orbit_ev_angstrom": 0.2,
                "topological_gap_delta_mev": 0.25,
                "zeeman_critical_field_tesla": 1.2,
                "bus_throughput_petabits_per_sec": 2800.0,
                "mzm_braiding_fidelity_percent": 99.99999,
                "status": "MAJORANA_ZERO_MODE_SHUTTLE_ACTIVE",
                "active_nanowire_channels": 4,
            },
            "channels": [],
            "shuttles": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class MajoranaNanowireBackboneService:
    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return ledger.get("telemetry", {})

    def get_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def shuttle_braid(
        self, channel_id: str, gate_bias_mv: float = 45.0
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        channels = ledger.get("channels", [])
        channel = next((c for c in channels if c.get("channel_id") == channel_id), None)
        if not channel and channels:
            channel = channels[0]

        shuttle_id = f"MZM-SHUTTLE-{uuid.uuid4().hex[:8].upper()}"
        record = {
            "shuttle_id": shuttle_id,
            "channel_id": channel.get("channel_id", channel_id)
            if channel
            else channel_id,
            "gate_voltage_bias_mv": gate_bias_mv,
            "braiding_angle_rad": 1.5708,
            "braiding_fidelity": 0.999999,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "MZM_BRAID_CYCLE_COMPLETED",
        }

        ledger.setdefault("shuttles", []).insert(0, record)
        if channel:
            channel["status"] = "BRAIDED_TOPOLOGICAL_STABILIZED"

        _save_ledger(ledger)
        return record


majorana_nanowire_service = MajoranaNanowireBackboneService()
