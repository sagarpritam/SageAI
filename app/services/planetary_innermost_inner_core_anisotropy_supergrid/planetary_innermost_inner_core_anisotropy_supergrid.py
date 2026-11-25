"""
Planetary Innermost Inner Core (IMIC) Anisotropic Lattice Supergrid Service (Option B Wave 59).
Harvests continuous multi-gigawatt zero-emission baseload power from Earth's Innermost Inner Core (IMIC)
at 5,700-6,371 km depth (350-364 GPa, 6,000-6,200 K, radius r < 650 km), tapping into the distinct ~55°
tilted fast-axis P-wave seismic anisotropy, central gravitational compression, and bcc-iron spin-phonon resonance.
"""

from typing import Dict, List, Any
import math
import time

class PlanetaryInnermostInnerCoreAnisotropySupergridService:
    def __init__(self):
        self._arrays: Dict[str, Dict[str, Any]] = {
            "IMIC-EQUATORIAL-FAST-AXIS-01": {
                "array_id": "IMIC-EQUATORIAL-FAST-AXIS-01",
                "name": "Innermost Inner Core Equatorial Fast-Axis Array 01",
                "radius_km": 350.0,
                "depth_km": 6021.0,
                "pressure_gpa": 360.0,
                "temperature_k": 6150.0,
                "tilt_angle_deg": 55.0,
                "base_anisotropy_pct": 3.2,
                "transducer_mode": "BCC-Iron Spin-Phonon Resonator",
            },
            "IMIC-GEOMETRIC-CENTER-CORE-02": {
                "array_id": "IMIC-GEOMETRIC-CENTER-CORE-02",
                "name": "Earth Geometric Center Singularity Transducer 02",
                "radius_km": 150.0,
                "depth_km": 6221.0,
                "pressure_gpa": 364.0,
                "temperature_k": 6200.0,
                "tilt_angle_deg": 58.5,
                "base_anisotropy_pct": 3.6,
                "transducer_mode": "Central Gravitational Piezo-Electric Mesh",
            },
            "IMIC-POLAR-TRANSITION-SHEAR-03": {
                "array_id": "IMIC-POLAR-TRANSITION-SHEAR-03",
                "name": "IMIC-to-OIC Lattice Phase Boundary Harvester 03",
                "radius_km": 600.0,
                "depth_km": 5771.0,
                "pressure_gpa": 352.0,
                "temperature_k": 6050.0,
                "tilt_angle_deg": 48.0,
                "base_anisotropy_pct": 2.8,
                "transducer_mode": "Telluric Thermo-Acoustic Waveguide",
            },
        }
        self._harvest_events_count = 0
        self._total_baseload_gw = 0.0

    def list_arrays(self) -> List[Dict[str, Any]]:
        return list(self._arrays.values())

    def get_arrays(self) -> List[Dict[str, Any]]:
        return self.list_arrays()

    def get_array(self, array_id: str) -> Dict[str, Any]:
        return self._arrays.get(array_id, self._arrays["IMIC-EQUATORIAL-FAST-AXIS-01"])

    def harvest_innermost_core_power(
        self,
        array_id: str,
        anisotropy_factor_override: float = 3.2,
        piezo_coupling_efficiency: float = 0.95,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        array = self.get_array(array_id)
        self._harvest_events_count += 1

        anisotropy = anisotropy_factor_override if anisotropy_factor_override > 0 else array["base_anisotropy_pct"]
        # Central baseload power from 360+ GPa gravitational compression & lattice anisotropy:
        # P = P_base * (pressure / 360) * (anisotropy / 3.0) * efficiency
        harvested_gw = round(7.5 * (array["pressure_gpa"] / 360.0) * (anisotropy / 3.0) * piezo_coupling_efficiency, 3)
        self._total_baseload_gw += harvested_gw

        compression_flux_mw = round(harvested_gw * 82.5, 2)
        grid_stability = round(99.92 + 0.05 * math.cos(math.radians(array["tilt_angle_deg"])), 2)

        return {
            "array_id": array["array_id"],
            "status": "INNERMOST_CORE_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "central_compression_flux_mw": compression_flux_mw,
            "radius_km": array["radius_km"],
            "depth_km": array["depth_km"],
            "pressure_gpa": array["pressure_gpa"],
            "temperature_k": array["temperature_k"],
            "tilt_angle_deg": array["tilt_angle_deg"],
            "anisotropy_factor_pct": anisotropy,
            "piezo_coupling_efficiency_pct": round(piezo_coupling_efficiency * 100.0, 1),
            "grid_stability_pct": grid_stability,
            "dispatch_duration_s": dispatch_duration_s,
            "innermost_lattice_state": "BCC_ANISOTROPIC_EQUATORIAL_FAST_AXIS_LOCKED",
            "timestamp": time.time(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "active_arrays_count": len(self._arrays),
            "harvest_events_total": self._harvest_events_count,
            "total_baseload_dispatch_gw": round(self._total_baseload_gw, 3),
            "mean_extraction_efficiency_pct": 95.0,
            "innermost_core_coupling_status": "INNERMOST_INNER_CORE_ANISOTROPY_LOCKED",
        }

_instance = None

def get_planetary_innermost_inner_core_anisotropy_supergrid_service() -> PlanetaryInnermostInnerCoreAnisotropySupergridService:
    global _instance
    if _instance is None:
        _instance = PlanetaryInnermostInnerCoreAnisotropySupergridService()
    return _instance
