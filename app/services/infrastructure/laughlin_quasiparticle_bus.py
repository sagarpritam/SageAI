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
    "infrastructure",
    "laughlin_quasiparticle_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "bus_id": "LAUGHLIN-ANYON-BUS-01",
            "bus_name": "Laughlin Quasiparticle Anyonic Fractionally Charged Interconnect Bus",
            "status": "OPERATIONAL",
            "filling_factor_nu": "1/3",
            "fractional_charge_e_star": 0.333333,
            "optical_bus_throughput_pbps": 5600.0,
            "anyon_braiding_fidelity": 0.99999999,
            "thermal_hall_dissipation_nw": 0.0,
            "channels": [],
            "modulation_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class LaughlinQuasiparticleBusService:
    def __init__(self) -> None:
        pass

    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "bus_id": ledger.get("bus_id", "LAUGHLIN-ANYON-BUS-01"),
            "bus_name": ledger.get(
                "bus_name",
                "Laughlin Quasiparticle Anyonic Fractionally Charged Interconnect Bus",
            ),
            "status": ledger.get("status", "OPERATIONAL"),
            "filling_factor_nu": ledger.get("filling_factor_nu", "1/3"),
            "fractional_charge_e_star": ledger.get(
                "fractional_charge_e_star", 0.333333
            ),
            "optical_bus_throughput_pbps": ledger.get(
                "optical_bus_throughput_pbps", 5600.0
            ),
            "anyon_braiding_fidelity": ledger.get(
                "anyon_braiding_fidelity", 0.99999999
            ),
            "thermal_hall_dissipation_nw": ledger.get(
                "thermal_hall_dissipation_nw", 0.0
            ),
            "active_laughlin_channels": len(ledger.get("channels", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_laughlin(
        self, channel_id: str, braiding_phase_rad: float
    ) -> Dict[str, Any]:
        ledger = _load_ledger()
        channels = ledger.get("channels", [])

        target_channel = None
        for ch in channels:
            if ch.get("channel_id") == channel_id:
                target_channel = ch
                break

        if not target_channel and channels:
            target_channel = channels[0]
            channel_id = target_channel.get("channel_id", "LAUGHLIN-NU-ONE-THIRD-ALPHA")

        updated_phase = round(abs(braiding_phase_rad), 4)
        if target_channel:
            target_channel["braiding_phase_rad"] = updated_phase
            target_channel["status"] = "BRAIDING_PHASE_TUNED"

        modulation_record = {
            "modulation_id": f"LAUGHLIN-MOD-{uuid.uuid4().hex[:8].upper()}",
            "channel_id": channel_id,
            "braiding_phase_rad": updated_phase,
            "fractional_charge_e": 0.3333,
            "braiding_fidelity": 0.99999999,
            "status": "MODULATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("modulation_history", [])
        history.append(modulation_record)
        ledger["modulation_history"] = history[-50:]
        _save_ledger(ledger)

        return modulation_record


laughlin_quasiparticle_service = LaughlinQuasiparticleBusService()
