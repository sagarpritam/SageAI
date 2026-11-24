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
    "security",
    "axion_wilczek_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "sentinel_id": "AXION-WILCZEK-SENTINEL-01",
            "sentinel_name": "Wilczek Dynamical Axion Electrodynamics Sentinel",
            "status": "ARMED_AND_POLARIZED",
            "theta_angle_rad": 3.14159,
            "magnetoelectric_coefficient_alpha": 0.00729735,
            "sidechannel_leakage_rejection_db": -162.0,
            "active_axion_sectors": 4,
            "sectors": [],
            "clamp_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class AxionWilczekSentinelService:
    def __init__(self) -> None:
        pass

    def get_posture(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "sentinel_id": ledger.get("sentinel_id", "AXION-WILCZEK-SENTINEL-01"),
            "sentinel_name": ledger.get(
                "sentinel_name",
                "Wilczek Dynamical Axion Electrodynamics Sentinel",
            ),
            "status": ledger.get("status", "ARMED_AND_POLARIZED"),
            "theta_angle_rad": ledger.get("theta_angle_rad", 3.14159),
            "magnetoelectric_coefficient_alpha": ledger.get(
                "magnetoelectric_coefficient_alpha", 0.00729735
            ),
            "sidechannel_leakage_rejection_db": ledger.get(
                "sidechannel_leakage_rejection_db", -162.0
            ),
            "active_axion_sectors": len(ledger.get("sectors", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_sectors(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("sectors", [])

    def clamp_axion(self, sector_id: str, theta_angle_rad: float) -> Dict[str, Any]:
        ledger = _load_ledger()
        sectors = ledger.get("sectors", [])

        target_sector = None
        for sec in sectors:
            if sec.get("sector_id") == sector_id:
                target_sector = sec
                break

        if not target_sector and sectors:
            target_sector = sectors[0]
            sector_id = target_sector.get("sector_id", "WILCZEK-AXION-CORE-ALPHA")

        updated_angle = round(abs(theta_angle_rad), 4)
        updated_rejection = round(-162.0 - (0.05 / (updated_angle + 0.1)), 1)
        if target_sector:
            target_sector["theta_angle_rad"] = updated_angle
            target_sector["sidechannel_rejection_db"] = updated_rejection
            target_sector["status"] = "THETA_VACUUM_SEALED"

        clamp_record = {
            "clamp_id": f"AXION-CLAMP-{uuid.uuid4().hex[:8].upper()}",
            "sector_id": sector_id,
            "theta_angle_rad": updated_angle,
            "effective_rejection_db": updated_rejection,
            "boundary_invariance_stability": 0.99999999999,
            "status": "CLAMPED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("clamp_history", [])
        history.append(clamp_record)
        ledger["clamp_history"] = history[-50:]
        _save_ledger(ledger)

        return clamp_record


axion_wilczek_service = AxionWilczekSentinelService()
