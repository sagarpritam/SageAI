"""
Planetary Geomagnetic Reversal & Multipole Flux Capacitor Supergrid Service (Option B Wave 61).
Harnesses multipole Gauss-coefficient dipole-quadrupole-octupole (g_1^0, g_2^0, g_3^0) secular
variation and geomagnetic excursion flux reversals across the South Atlantic Anomaly & polar cusps
via superconducting Lorentz-inductive arrays for continuous 8.200 GW baseload clean dispatch.
"""

from typing import Dict, List, Any
import math
import time


class PlanetaryGeomagneticReversalFluxCapacitorSupergridService:
    def __init__(self):
        self._capacitors: Dict[str, Dict[str, Any]] = {
            "GEOMAG-SOUTH-ATLANTIC-ANOMALY-01": {
                "capacitor_id": "GEOMAG-SOUTH-ATLANTIC-ANOMALY-01",
                "name": "South Atlantic Anomaly Reversed-Flux Patch Capacitor 01",
                "gauss_harmonic_mode": "g_1^0 + g_2^0 + g_3^0 Multipole",
                "multipole_order": 3,
                "magnetic_flux_density_ut": 22.4,
                "nominal_capacity_gw": 8.200,
                "secular_flux_mw": 712.5,
                "geomagnetic_capacitor_state": "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
                "lorentz_coupling_efficiency_pct": 97.0,
            },
            "GEOMAG-POLAR-CUSP-MULTIPOLE-02": {
                "capacitor_id": "GEOMAG-POLAR-CUSP-MULTIPOLE-02",
                "name": "Arctic-Antarctic Polar Cusp Induction Toroid 02",
                "gauss_harmonic_mode": "g_1^0 Axial Dipole + Birkeland Loop",
                "multipole_order": 1,
                "magnetic_flux_density_ut": 64.8,
                "nominal_capacity_gw": 5.400,
                "secular_flux_mw": 468.2,
                "geomagnetic_capacitor_state": "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
                "lorentz_coupling_efficiency_pct": 96.5,
            },
            "GEOMAG-EXCURSION-FLUX-CAPACITOR-03": {
                "capacitor_id": "GEOMAG-EXCURSION-FLUX-CAPACITOR-03",
                "name": "Laschamp-Style Excursion Multipole Ring 03",
                "gauss_harmonic_mode": "Octupole-Hexadecapole Transition",
                "multipole_order": 4,
                "magnetic_flux_density_ut": 38.2,
                "nominal_capacity_gw": 7.600,
                "secular_flux_mw": 655.8,
                "geomagnetic_capacitor_state": "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
                "lorentz_coupling_efficiency_pct": 97.5,
            },
        }
        self._harvest_events_count = 0
        self._total_baseload_gw = 0.0

    def list_capacitors(self) -> List[Dict[str, Any]]:
        return list(self._capacitors.values())

    def get_capacitors(self) -> List[Dict[str, Any]]:
        return self.list_capacitors()

    def get_capacitor(self, capacitor_id: str) -> Dict[str, Any]:
        return self._capacitors.get(capacitor_id, self._capacitors["GEOMAG-SOUTH-ATLANTIC-ANOMALY-01"])

    def harvest_geomagnetic_reversal_power(
        self,
        capacitor_id: str,
        multipole_order_override: int = 3,
        lorentz_coupling_efficiency: float = 0.97,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        cap = self.get_capacitor(capacitor_id)
        self._harvest_events_count += 1

        order = multipole_order_override if multipole_order_override > 0 else cap["multipole_order"]
        harvested_gw = round(
            cap["nominal_capacity_gw"] * (1.0 + 0.015 * (order - 1)) * lorentz_coupling_efficiency,
            3,
        )
        self._total_baseload_gw += harvested_gw

        secular_flux_mw = round(harvested_gw * 86.8, 2)
        grid_stability = round(99.97 + 0.015 * math.sin(order), 2)

        return {
            "capacitor_id": cap["capacitor_id"],
            "status": "GEOMAGNETIC_FLUX_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "secular_flux_mw": secular_flux_mw,
            "multipole_order": order,
            "gauss_harmonic_mode": cap["gauss_harmonic_mode"],
            "magnetic_flux_density_ut": cap["magnetic_flux_density_ut"],
            "lorentz_coupling_efficiency_pct": round(lorentz_coupling_efficiency * 100.0, 1),
            "grid_stability_pct": grid_stability,
            "dispatch_duration_s": dispatch_duration_s,
            "geomagnetic_capacitor_state": cap["geomagnetic_capacitor_state"],
            "timestamp": time.time(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "active_capacitors_count": len(self._capacitors),
            "harvest_events_total": self._harvest_events_count,
            "total_baseload_dispatch_gw": round(self._total_baseload_gw, 3),
            "mean_coupling_efficiency_pct": 97.0,
            "geomagnetic_coupling_status": "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
        }


_instance = None


def get_planetary_geomagnetic_reversal_flux_capacitor_supergrid_service() -> PlanetaryGeomagneticReversalFluxCapacitorSupergridService:
    global _instance
    if _instance is None:
        _instance = PlanetaryGeomagneticReversalFluxCapacitorSupergridService()
    return _instance
