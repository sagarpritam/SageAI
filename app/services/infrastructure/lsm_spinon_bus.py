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
    "lsm_spinon_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "bus_id": "LSM-SPINON-BUS-01",
            "bus_name": "Lieb-Schultz-Mattis Fractionalized Spinon Interconnect Bus",
            "status": "OPERATIONAL",
            "optical_bus_throughput_pbps": 5400.0,
            "spinon_fermi_velocity_m_s": 1420000.0,
            "topological_luttinger_parameter_k": 1.0,
            "spin_charge_separation_fidelity": 0.9999999,
            "fractional_excitation_fidelity": 0.99999995,
            "channels": [],
            "modulation_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class LSMSpinonBusService:
    def __init__(self) -> None:
        pass

    def get_telemetry(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "bus_id": ledger.get("bus_id", "LSM-SPINON-BUS-01"),
            "bus_name": ledger.get(
                "bus_name",
                "Lieb-Schultz-Mattis Fractionalized Spinon Interconnect Bus",
            ),
            "status": ledger.get("status", "OPERATIONAL"),
            "optical_bus_throughput_pbps": ledger.get(
                "optical_bus_throughput_pbps", 5400.0
            ),
            "spinon_fermi_velocity_m_s": ledger.get(
                "spinon_fermi_velocity_m_s", 1420000.0
            ),
            "topological_luttinger_parameter_k": ledger.get(
                "topological_luttinger_parameter_k", 1.0
            ),
            "spin_charge_separation_fidelity": ledger.get(
                "spin_charge_separation_fidelity", 0.9999999
            ),
            "fractional_excitation_fidelity": ledger.get(
                "fractional_excitation_fidelity", 0.99999995
            ),
            "active_spinon_channels": len(ledger.get("channels", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_channels(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("channels", [])

    def modulate_spinon(
        self, channel_id: str, spinon_momentum_k_rad: float
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
            channel_id = target_channel.get("channel_id", "LSM-SPINON-EXCITATION-ALPHA")

        updated_velocity = round(
            1400000.0 + (abs(spinon_momentum_k_rad) % 3.14159) * 15000.0, 1
        )
        if target_channel:
            target_channel["spinon_momentum_k_rad"] = round(spinon_momentum_k_rad, 4)
            target_channel["fermi_velocity_m_s"] = updated_velocity
            target_channel["status"] = "SPINON_MOMENTUM_TUNED"

        modulation_record = {
            "modulation_id": f"LSM-MOD-{uuid.uuid4().hex[:8].upper()}",
            "channel_id": channel_id,
            "spinon_momentum_k_rad": round(spinon_momentum_k_rad, 4),
            "adjusted_fermi_velocity_m_s": updated_velocity,
            "excitation_fidelity": 0.99999995,
            "status": "MODULATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("modulation_history", [])
        history.append(modulation_record)
        ledger["modulation_history"] = history[-50:]
        _save_ledger(ledger)

        return modulation_record


lsm_spinon_service = LSMSpinonBusService()
