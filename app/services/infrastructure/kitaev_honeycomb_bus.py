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
    "kitaev_honeycomb_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "bus_id": "KITAEV-HONEYCOMB-BUS-01",
            "bus_name": "Kitaev Honeycomb Toric Spin-Liquid Optical Interconnect Bus",
            "status": "OPERATIONAL",
            "exchange_coupling_j": 1.0,
            "vortex_flux_gap_delta": 0.26,
            "optical_bus_throughput_pbps": 6000.0,
            "itinerant_majorana_fidelity": 0.99999999,
            "z2_flux_pinning_stability": 0.999999999,
            "channels": [],
            "modulation_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class KitaevHoneycombBusService:
    def __init__(self) -> None:
        pass

    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "bus_id": ledger.get("bus_id", "KITAEV-HONEYCOMB-BUS-01"),
            "bus_name": ledger.get(
                "bus_name",
                "Kitaev Honeycomb Toric Spin-Liquid Optical Interconnect Bus",
            ),
            "status": ledger.get("status", "OPERATIONAL"),
            "exchange_coupling_j": ledger.get("exchange_coupling_j", 1.0),
            "vortex_flux_gap_delta": ledger.get("vortex_flux_gap_delta", 0.26),
            "optical_bus_throughput_pbps": ledger.get(
                "optical_bus_throughput_pbps", 6000.0
            ),
            "itinerant_majorana_fidelity": ledger.get(
                "itinerant_majorana_fidelity", 0.99999999
            ),
            "z2_flux_pinning_stability": ledger.get(
                "z2_flux_pinning_stability", 0.999999999
            ),
            "active_kitaev_channels": len(ledger.get("channels", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_kitaev(self, channel_id: str, flux_bias_rad: float) -> Dict[str, Any]:
        ledger = _load_ledger()
        channels = ledger.get("channels", [])

        target_channel = None
        for ch in channels:
            if ch.get("channel_id") == channel_id:
                target_channel = ch
                break

        if not target_channel and channels:
            target_channel = channels[0]
            channel_id = target_channel.get("channel_id", "KITAEV-DIRAC-CONE-ALPHA")

        updated_bias = round(abs(flux_bias_rad), 4)
        if target_channel:
            target_channel["flux_bias_rad"] = updated_bias
            target_channel["status"] = "DIRAC_CONE_PINNED"

        modulation_record = {
            "modulation_id": f"KITAEV-MOD-{uuid.uuid4().hex[:8].upper()}",
            "channel_id": channel_id,
            "flux_bias_rad": updated_bias,
            "itinerant_majorana_fidelity": 0.99999999,
            "status": "MODULATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("modulation_history", [])
        history.append(modulation_record)
        ledger["modulation_history"] = history[-50:]
        _save_ledger(ledger)

        return modulation_record


kitaev_honeycomb_service = KitaevHoneycombBusService()
