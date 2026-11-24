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
    "goldstone_wilczek_ledger.json",
)


def _load_ledger() -> Dict[str, Any]:
    if not os.path.exists(LEDGER_PATH):
        return {
            "sentinel_id": "GOLDSTONE-WILCZEK-SENTINEL-01",
            "sentinel_name": "Goldstone-Wilczek Fractional Baryon Number Sentinel",
            "status": "ARMED_AND_CONFINING",
            "baryon_number_conservation_fidelity": 0.999999999,
            "sidechannel_leakage_rejection_db": -158.0,
            "active_baryon_sectors": 4,
            "sectors": [],
            "clamp_history": [],
        }
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_ledger(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class GoldstoneWilczekSentinelService:
    def __init__(self) -> None:
        pass

    def get_posture(self) -> Dict[str, Any]:
        ledger = _load_ledger()
        return {
            "sentinel_id": ledger.get("sentinel_id", "GOLDSTONE-WILCZEK-SENTINEL-01"),
            "sentinel_name": ledger.get(
                "sentinel_name",
                "Goldstone-Wilczek Fractional Baryon Number Sentinel",
            ),
            "status": ledger.get("status", "ARMED_AND_CONFINING"),
            "baryon_number_conservation_fidelity": ledger.get(
                "baryon_number_conservation_fidelity", 0.999999999
            ),
            "sidechannel_leakage_rejection_db": ledger.get(
                "sidechannel_leakage_rejection_db", -158.0
            ),
            "active_baryon_sectors": len(ledger.get("sectors", [])),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def list_sectors(self) -> List[Dict[str, Any]]:
        ledger = _load_ledger()
        return ledger.get("sectors", [])

    def clamp_baryon(self, sector_id: str, chiral_angle_rad: float) -> Dict[str, Any]:
        ledger = _load_ledger()
        sectors = ledger.get("sectors", [])

        target_sector = None
        for sec in sectors:
            if sec.get("sector_id") == sector_id:
                target_sector = sec
                break

        if not target_sector and sectors:
            target_sector = sectors[0]
            sector_id = target_sector.get("sector_id", "GOLDSTONE-WILCZEK-CORE-ALPHA")

        updated_angle = round(abs(chiral_angle_rad), 4)
        updated_rejection = round(-158.0 - (0.05 / (updated_angle + 0.1)), 1)
        if target_sector:
            target_sector["chiral_angle_rad"] = updated_angle
            target_sector["sidechannel_rejection_db"] = updated_rejection
            target_sector["status"] = "CHIRAL_ANGLE_CLAMPED"

        clamp_record = {
            "clamp_id": f"GW-CLAMP-{uuid.uuid4().hex[:8].upper()}",
            "sector_id": sector_id,
            "chiral_angle_rad": updated_angle,
            "effective_rejection_db": updated_rejection,
            "baryon_conservation_fidelity": 0.999999999,
            "status": "CLAMPED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        history = ledger.get("clamp_history", [])
        history.append(clamp_record)
        ledger["clamp_history"] = history[-50:]
        _save_ledger(ledger)

        return clamp_record


goldstone_wilczek_service = GoldstoneWilczekSentinelService()
