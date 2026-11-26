import time
from typing import Any, Dict, List


class PlanetaryGeomagneticSubstormElectrojetSupergridService:
    """Option B Wave 76: Planetary Geomagnetic Substorm & Auroral Electrojet Supergrid."""

    def __init__(self) -> None:
        self._harvest_events_total: int = 0
        self._electrojets: List[Dict[str, Any]] = [
            {
                "electrojet_id": "ELECTROJET-WESTWARD-01",
                "ionospheric_band": "64.0°–71.0° N (110 km)",
                "hall_current_ma": 1.85,
                "electrojet_flux_mw": 11680.0,
                "nominal_baseload_gw": 4.14,
                "induction_efficiency_pct": 99.6,
                "electrojet_state": "ELECTROJET_SUBSTORM_LOCKED",
            },
            {
                "electrojet_id": "ELECTROJET-EASTWARD-02",
                "ionospheric_band": "63.5°–70.5° S (115 km)",
                "hall_current_ma": 1.68,
                "electrojet_flux_mw": 11420.0,
                "nominal_baseload_gw": 3.92,
                "induction_efficiency_pct": 99.5,
                "electrojet_state": "ELECTROJET_SUBSTORM_LOCKED",
            },
            {
                "electrojet_id": "ELECTROJET-HARANG-03",
                "ionospheric_band": "Harang Discontinuity",
                "hall_current_ma": 1.52,
                "electrojet_flux_mw": 10940.0,
                "nominal_baseload_gw": 3.62,
                "induction_efficiency_pct": 99.4,
                "electrojet_state": "ELECTROJET_SUBSTORM_LOCKED",
            },
        ]

    def list_electrojets(self) -> Dict[str, Any]:
        return {"electrojets": self._electrojets, "total": len(self._electrojets)}

    def harvest_electrojet_power(
        self,
        electrojet_id: str = "ELECTROJET-WESTWARD-01",
        substorm_multiplier: float = 1.05,
        induction_efficiency: float = 0.996,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        self._harvest_events_total += 1
        base = next((e for e in self._electrojets if e["electrojet_id"] == electrojet_id), self._electrojets[0])
        harvested_gw = round(base["nominal_baseload_gw"] * substorm_multiplier * induction_efficiency * 2.8, 3)
        return {
            "electrojet_id": base["electrojet_id"],
            "status": "ELECTROJET_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "electrojet_flux_mw": round(harvested_gw * 1000.0, 2),
            "ionospheric_band": base["ionospheric_band"],
            "hall_current_ma": base["hall_current_ma"],
            "induction_efficiency_pct": round(induction_efficiency * 100.0, 2),
            "grid_stability_pct": 99.999,
            "dispatch_duration_s": dispatch_duration_s,
            "electrojet_coupling_state": "ELECTROJET_SUBSTORM_LOCKED",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def get_metrics(self) -> Dict[str, Any]:
        total_gw = round(sum(e["nominal_baseload_gw"] for e in self._electrojets), 3)
        mean_eff = round(sum(e["induction_efficiency_pct"] for e in self._electrojets) / len(self._electrojets), 2)
        return {
            "active_electrojets_count": len(self._electrojets),
            "harvest_events_total": self._harvest_events_total,
            "total_baseload_dispatch_gw": total_gw,
            "mean_induction_efficiency_pct": mean_eff,
            "electrojet_coupling_status": "ELECTROJET_SUBSTORM_LOCKED",
        }


_service = PlanetaryGeomagneticSubstormElectrojetSupergridService()


def get_planetary_geomagnetic_substorm_electrojet_supergrid_service() -> PlanetaryGeomagneticSubstormElectrojetSupergridService:
    return _service
