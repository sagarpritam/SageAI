"""
Planetary F-Layer Inner-Core Slurry Stratification Supergrid Service.
Taps into the 250 km thick stably stratified F-layer sedimentation zone of iron-snow
crystallites falling inward and light-element enriched liquid rising outward.
"""

import math
import time
from typing import Any, Dict, List


class PlanetaryFLayerSlurrySupergridService:
    def __init__(self) -> None:
        self._arrays: List[Dict[str, Any]] = [
            {
                "array_id": "F-LAYER-PACIFIC-SEDIMENT-01",
                "region_name": "Pacific F-Layer Slurry Basin",
                "depth_km": 4950.0,
                "layer_thickness_km": 250.0,
                "pressure_gpa": 315.0,
                "temperature_k": 5500.0,
                "iron_sedimentation_rate_mm_yr": 2.4,
                "stratification_buoyancy_ms2": 0.082,
                "base_stability_pct": 99.92,
            },
            {
                "array_id": "F-LAYER-ATLANTIC-STRATIFIED-02",
                "region_name": "Atlantic F-Layer Density Anomaly Column",
                "depth_km": 5050.0,
                "layer_thickness_km": 220.0,
                "pressure_gpa": 322.0,
                "temperature_k": 5600.0,
                "iron_sedimentation_rate_mm_yr": 2.1,
                "stratification_buoyancy_ms2": 0.078,
                "base_stability_pct": 99.94,
            },
            {
                "array_id": "F-LAYER-EQUATORIAL-SLURRY-03",
                "region_name": "Equatorial F-Layer Iron-Snow Reservoir",
                "depth_km": 5120.0,
                "layer_thickness_km": 240.0,
                "pressure_gpa": 328.0,
                "temperature_k": 5700.0,
                "iron_sedimentation_rate_mm_yr": 2.8,
                "stratification_buoyancy_ms2": 0.089,
                "base_stability_pct": 99.90,
            },
        ]
        self._harvest_events_total = 0
        self._total_baseload_dispatch_gw = 0.0

    def get_arrays(self) -> List[Dict[str, Any]]:
        return self._arrays

    def get_array(self, array_id: str) -> Dict[str, Any]:
        for a in self._arrays:
            if a["array_id"] == array_id:
                return a
        return self._arrays[0]

    def harvest_slurry_power(
        self,
        array_id: str,
        sedimentation_rate_override_mm_yr: float = 2.5,
        magnetostrictive_efficiency: float = 0.95,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        arr = self.get_array(array_id)

        rate = sedimentation_rate_override_mm_yr if sedimentation_rate_override_mm_yr > 0 else arr["iron_sedimentation_rate_mm_yr"]
        depth = arr["depth_km"]
        thickness = arr["layer_thickness_km"]
        buoyancy = arr["stratification_buoyancy_ms2"]

        # Harvested electrical baseload power in GW (7.2 - 7.6 GW nominal range)
        harvested_gw = round(
            6.5 + (rate * 0.32) + (thickness * 0.002) + (buoyancy * 2.5),
            3,
        )

        # Sedimentation thermal/kinetic flux in MW
        sedimentation_flux_mw = round(
            harvested_gw * 1000.0 * 0.078,
            2,
        )

        # Stratification Brunt-Vaisala frequency
        strat_freq = round(math.sqrt(max(1e-6, buoyancy / (thickness * 1000.0))) * 1000.0, 4)

        grid_stability_pct = round(
            min(99.99, arr["base_stability_pct"] + 0.01),
            2,
        )

        self._harvest_events_total += 1
        self._total_baseload_dispatch_gw += harvested_gw

        return {
            "array_id": array_id,
            "status": "F_LAYER_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "sedimentation_flux_mw": sedimentation_flux_mw,
            "f_layer_depth_km": depth,
            "layer_thickness_km": thickness,
            "pressure_gpa": arr["pressure_gpa"],
            "temperature_k": arr["temperature_k"],
            "sedimentation_rate_mm_yr": rate,
            "stratification_frequency_rad_s": strat_freq,
            "magnetostrictive_efficiency_pct": round(magnetostrictive_efficiency * 100.0, 1),
            "grid_stability_pct": grid_stability_pct,
            "dispatch_duration_s": dispatch_duration_s,
            "slurry_phase": "STABLY_STRATIFIED_EPSILON_FE_SEDIMENT",
            "timestamp": time.time(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "active_arrays_count": len(self._arrays),
            "harvest_events_total": self._harvest_events_total,
            "total_baseload_dispatch_gw": round(self._total_baseload_dispatch_gw, 3),
            "mean_extraction_efficiency_pct": 95.0,
            "f_layer_coupling_status": "F_LAYER_SLURRY_STRATIFICATION_LOCKED",
        }


_instance: PlanetaryFLayerSlurrySupergridService | None = None


def get_planetary_f_layer_slurry_supergrid_service() -> PlanetaryFLayerSlurrySupergridService:
    global _instance
    if _instance is None:
        _instance = PlanetaryFLayerSlurrySupergridService()
    return _instance
