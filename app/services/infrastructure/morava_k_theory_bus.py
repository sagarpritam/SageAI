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
    "morava_k_theory_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "bus_id": "MORAVA-K-THEORY-BUS-01",
            "bus_name": "Moore-Tate Morava K-Theory Chromatic Interconnect Bus",
            "status": "OPERATIONAL",
            "optical_bus_throughput_pbps": 6600.0,
            "formal_group_obstruction": 0.0,
            "chromatic_filtration_fidelity": 0.99999999,
            "chromatic_height": 3,
            "active_morava_channels": 4,
            "channels": [],
            "modulations": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class MoravaKTheoryBusService:
    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "bus_id": ledger.get("bus_id", "MORAVA-K-THEORY-BUS-01"),
            "bus_name": ledger.get(
                "bus_name",
                "Moore-Tate Morava K-Theory Chromatic Interconnect Bus",
            ),
            "status": ledger.get("status", "OPERATIONAL"),
            "optical_bus_throughput_pbps": ledger.get(
                "optical_bus_throughput_pbps", 6600.0
            ),
            "formal_group_obstruction": ledger.get("formal_group_obstruction", 0.0),
            "chromatic_filtration_fidelity": ledger.get(
                "chromatic_filtration_fidelity", 0.99999999
            ),
            "chromatic_height": ledger.get("chromatic_height", 3),
            "active_morava_channels": len(ledger.get("channels", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_morava(
        self, channel_id: str, formal_group_bias_rad: float
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
            channel_id = target_channel.get("channel_id", "MORAVA-K3-CHROMATIC-ALPHA")

        updated_bias = round(abs(formal_group_bias_rad), 4)
        if target_channel:
            target_channel["deformation_parameter_v"] = updated_bias
            target_channel["status"] = "LUBIN_TATE_DEFORMED"

        mod_record = {
            "modulation_id": f"MORAVA-MOD-{uuid.uuid4().hex[:8].upper()}",
            "channel_id": channel_id,
            "formal_group_bias_rad": updated_bias,
            "chromatic_fidelity": 0.99999999,
            "status": "MODULATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        modulations = ledger.get("modulations", [])
        modulations.append(mod_record)
        ledger["modulations"] = modulations[-50:]
        ledger["last_updated"] = datetime.now(timezone.utc).isoformat()
        _save_ledger(ledger)

        return mod_record


morava_k_theory_service = MoravaKTheoryBusService()

# Module-level aliases
get_morava_telemetry = morava_k_theory_service.get_telemetry
get_morava_channels = morava_k_theory_service.list_channels
modulate_morava = morava_k_theory_service.modulate_morava
