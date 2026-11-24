import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
LEDGER_PATH = os.path.join(
    ROOT_DIR, "artifacts", "infrastructure", "hoti_bismuth_ledger.json"
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "telemetry": {
                "backbone_id": "HOTI-BISMUTH-HINGE-01",
                "topological_order": "SECOND_ORDER_HOTI_D2",
                "crystal_phase": "ALPHA_BISMUTH_RHOMBOHEDRAL",
                "spatial_symmetry_protection": "INVERSION_I_AND_C3_ROTATION",
                "fractional_corner_charge_e": 0.5,
                "network_throughput_petabits_per_sec": 2600.0,
                "corner_state_localization_fidelity_percent": 99.99999,
                "status": "HOTI_CORNER_HINGE_STREAMING_OPTIMAL",
                "active_hoti_channels": 4,
            },
            "channels": [],
            "tunings": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class HOTIBismuthBackboneService:
    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return ledger.get("telemetry", {})

    def get_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def tune_corner_mode(
        self, channel_id: str, bias_potential_mv: float = 15.0
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        channels = ledger.get("channels", [])
        channel = next((c for c in channels if c.get("channel_id") == channel_id), None)
        if not channel and channels:
            channel = channels[0]

        tuning_id = f"HOTI-TUNE-{uuid.uuid4().hex[:8].upper()}"
        confinement = 0.999999
        phase_shift = round(bias_potential_mv * 0.1047, 4)

        record = {
            "tuning_id": tuning_id,
            "channel_id": channel.get("channel_id", channel_id)
            if channel
            else channel_id,
            "hinge_bias_potential_mv": bias_potential_mv,
            "corner_confinement_ratio": confinement,
            "optical_phase_shift_rad": phase_shift,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "CORNER_MODE_TUNED_LOCKED",
        }

        ledger.setdefault("tunings", []).insert(0, record)
        if channel:
            channel["status"] = "CORNER_MODE_TUNED_COHERENT"

        _save_ledger(ledger)
        return record


hoti_bismuth_service = HOTIBismuthBackboneService()
