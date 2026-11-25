"""
Planetary Magnetospheric Birkeland Current & Auroral Electrojet Supergrid Service (Option B Wave 62).
Harnesses Region-1 & Region-2 field-aligned Birkeland currents (10^6 - 10^7 A) and auroral
electrojet Hall/Pedersen ionospheric closure at 100-130 km altitude via superconducting
orbital-ground magnetotelluric tethers for continuous 8.400 GW baseload clean dispatch.
"""

from typing import Dict, List, Any
import math
import time


class PlanetaryMagnetosphericBirkelandAuroralElectrojetSupergridService:
    def __init__(self):
        self._electrojets: Dict[str, Dict[str, Any]] = {
            "BIRKELAND-REGION1-AURORAL-OVAL-01": {
                "electrojet_id": "BIRKELAND-REGION1-AURORAL-OVAL-01",
                "name": "Region-1 Field-Aligned Birkeland Sheet & Auroral Electrojet 01",
                "altitude_km": 115.0,
                "field_aligned_current_ma": 5.4,
                "hall_pedersen_ratio": 2.2,
                "nominal_capacity_gw": 8.400,
                "ionospheric_flux_mw": 732.0,
                "birkeland_coupling_state": "BIRKELAND_ELECTROJET_LOCKED",
                "tether_efficiency_pct": 97.5,
            },
            "BIRKELAND-REGION2-RING-CURRENT-02": {
                "electrojet_id": "BIRKELAND-REGION2-RING-CURRENT-02",
                "name": "Region-2 Inner Magnetosphere Ring-Current Closure 02",
                "altitude_km": 125.0,
                "field_aligned_current_ma": 3.8,
                "hall_pedersen_ratio": 1.9,
                "nominal_capacity_gw": 6.200,
                "ionospheric_flux_mw": 540.0,
                "birkeland_coupling_state": "BIRKELAND_ELECTROJET_LOCKED",
                "tether_efficiency_pct": 97.0,
            },
            "BIRKELAND-SUBSTORMS-WEDGE-03": {
                "electrojet_id": "BIRKELAND-SUBSTORMS-WEDGE-03",
                "name": "Substorm Current Wedge Tail-to-Ionosphere Harvester 03",
                "altitude_km": 108.0,
                "field_aligned_current_ma": 7.2,
                "hall_pedersen_ratio": 2.5,
                "nominal_capacity_gw": 7.800,
                "ionospheric_flux_mw": 680.0,
                "birkeland_coupling_state": "BIRKELAND_ELECTROJET_LOCKED",
                "tether_efficiency_pct": 98.0,
            },
        }
        self._harvest_events_count = 0
        self._total_baseload_gw = 0.0

    def list_electrojets(self) -> List[Dict[str, Any]]:
        return list(self._electrojets.values())

    def get_electrojets(self) -> List[Dict[str, Any]]:
        return self.list_electrojets()

    def get_electrojet(self, electrojet_id: str) -> Dict[str, Any]:
        return self._electrojets.get(electrojet_id, self._electrojets["BIRKELAND-REGION1-AURORAL-OVAL-01"])

    def harvest_birkeland_electrojet_power(
        self,
        electrojet_id: str,
        current_multiplier_override: float = 1.05,
        tether_efficiency: float = 0.975,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        jet = self.get_electrojet(electrojet_id)
        self._harvest_events_count += 1

        mult = current_multiplier_override if current_multiplier_override > 0 else 1.05
        harvested_gw = round(jet["nominal_capacity_gw"] * mult * tether_efficiency, 3)
        self._total_baseload_gw += harvested_gw

        ionospheric_flux_mw = round(harvested_gw * 87.2, 2)
        grid_stability = round(99.97 + 0.02 * math.sin(jet["field_aligned_current_ma"]), 2)

        return {
            "electrojet_id": jet["electrojet_id"],
            "status": "BIRKELAND_ELECTROJET_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "ionospheric_flux_mw": ionospheric_flux_mw,
            "altitude_km": jet["altitude_km"],
            "field_aligned_current_ma": jet["field_aligned_current_ma"],
            "hall_pedersen_ratio": jet["hall_pedersen_ratio"],
            "tether_efficiency_pct": round(tether_efficiency * 100.0, 1),
            "grid_stability_pct": grid_stability,
            "dispatch_duration_s": dispatch_duration_s,
            "birkeland_coupling_state": jet["birkeland_coupling_state"],
            "timestamp": time.time(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "active_electrojets_count": len(self._electrojets),
            "harvest_events_total": self._harvest_events_count,
            "total_baseload_dispatch_gw": round(self._total_baseload_gw, 3),
            "mean_tether_efficiency_pct": 97.5,
            "birkeland_coupling_status": "BIRKELAND_ELECTROJET_LOCKED",
        }


_instance = None


def get_planetary_magnetospheric_birkeland_auroral_electrojet_supergrid_service() -> PlanetaryMagnetosphericBirkelandAuroralElectrojetSupergridService:
    global _instance
    if _instance is None:
        _instance = PlanetaryMagnetosphericBirkelandAuroralElectrojetSupergridService()
    return _instance
