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
    "haag_kastler_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "bus_id": "HAAG-KASTLER-BUS-01",
            "bus_name": "Haag-Kastler Axiomatic Algebraic Quantum Field Theory Net Interconnect Bus",
            "status": "OPERATIONAL",
            "optical_bus_throughput_pbps": 6200.0,
            "microcausality_fidelity": 0.99999999,
            "causal_split_gap_gev": 1.25,
            "superluminal_dissipation_nw": 0.0,
            "channels": [],
            "modulation_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class HaagKastlerBusService:
    def __init__(self) -> None:
        pass

    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "bus_id": ledger.get("bus_id", "HAAG-KASTLER-BUS-01"),
            "bus_name": ledger.get(
                "bus_name",
                "Haag-Kastler Axiomatic Algebraic Quantum Field Theory Net Interconnect Bus",
            ),
            "status": ledger.get("status", "OPERATIONAL"),
            "optical_bus_throughput_pbps": ledger.get(
                "optical_bus_throughput_pbps", 6200.0
            ),
            "microcausality_fidelity": ledger.get(
                "microcausality_fidelity", 0.99999999
            ),
            "causal_split_gap_gev": ledger.get("causal_split_gap_gev", 1.25),
            "superluminal_dissipation_nw": ledger.get(
                "superluminal_dissipation_nw", 0.0
            ),
            "active_haag_channels": len(ledger.get("channels", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_haag(
        self, channel_id: str, diamond_volume_m3: float
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
            channel_id = target_channel.get("channel_id", "HAAG-CAUSAL-DIAMOND-ALPHA")

        updated_volume = round(abs(diamond_volume_m3), 4)
        if target_channel:
            target_channel["diamond_volume_m3"] = updated_volume
            target_channel["status"] = "MICROCAUSALITY_ENFORCED"

        modulation_record = {
            "modulation_id": f"HAAG-MOD-{uuid.uuid4().hex[:8].upper()}",
            "channel_id": channel_id,
            "diamond_volume_m3": updated_volume,
            "microcausality_fidelity": 0.99999999,
            "status": "MODULATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("modulation_history", [])
        history.append(modulation_record)
        ledger["modulation_history"] = history[-50:]
        _save_ledger(ledger)

        return modulation_record


haag_kastler_service = HaagKastlerBusService()
