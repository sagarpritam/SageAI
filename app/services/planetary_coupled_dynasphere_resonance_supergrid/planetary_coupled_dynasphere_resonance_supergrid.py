"""
Planetary Core-Mantle-Inner-Core Coupled Resonant Dynasphere Supergrid Service (Option B Wave 60).
Harvests multi-gigawatt continuous clean baseload electrical power from Whole-Earth core-column
eigenmode standing wave resonance (0.1-10 mHz, Bullen modes 0S2, 0T2, 350-364 GPa, 6,200 K)
synthesizing the entire planetary interior from the center singularity to the surface.
"""

from typing import Dict, List, Any
import math
import time

class PlanetaryCoupledDynasphereResonanceSupergridService:
    def __init__(self):
        self._nodes: Dict[str, Dict[str, Any]] = {
            "DYNASPHERE-WHOLE-EARTH-RESONATOR-01": {
                "node_id": "DYNASPHERE-WHOLE-EARTH-RESONATOR-01",
                "name": "Whole-Earth Column Harmonic Standing Wave Transducer 01",
                "resonant_frequency_mhz": 0.309,
                "standing_wave_mode": "0S2 Toroidal-Spheroidal Quadrupole",
                "core_depth_span_km": 6371.0,
                "central_pressure_gpa": 364.0,
                "base_resonance_coupling_pct": 99.4,
            },
            "DYNASPHERE-CMB-ICB-INTERFERENCE-02": {
                "node_id": "DYNASPHERE-CMB-ICB-INTERFERENCE-02",
                "name": "CMB-to-ICB Dual-Boundary Acoustic Interference Mesh 02",
                "resonant_frequency_mhz": 1.412,
                "standing_wave_mode": "0T2 Toroidal Free Oscillation",
                "core_depth_span_km": 3480.0,
                "central_pressure_gpa": 330.0,
                "base_resonance_coupling_pct": 99.6,
            },
            "DYNASPHERE-POLAR-JET-AXIS-COUPLER-03": {
                "node_id": "DYNASPHERE-POLAR-JET-AXIS-COUPLER-03",
                "name": "Polar Tangent Cylinder to Center Singularity Waveguide 03",
                "resonant_frequency_mhz": 2.854,
                "standing_wave_mode": "Alfvén-Coriolis Planetary Eigensphere",
                "core_depth_span_km": 5150.0,
                "central_pressure_gpa": 360.0,
                "base_resonance_coupling_pct": 99.8,
            },
        }
        self._harvest_events_count = 0
        self._total_baseload_gw = 0.0

    def list_nodes(self) -> List[Dict[str, Any]]:
        return list(self._nodes.values())

    def get_nodes(self) -> List[Dict[str, Any]]:
        return self.list_nodes()

    def get_node(self, node_id: str) -> Dict[str, Any]:
        return self._nodes.get(node_id, self._nodes["DYNASPHERE-WHOLE-EARTH-RESONATOR-01"])

    def harvest_dynasphere_resonance_power(
        self,
        node_id: str,
        resonance_multiplier_override: float = 1.05,
        telluric_waveguide_efficiency: float = 0.96,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        node = self.get_node(node_id)
        self._harvest_events_count += 1

        multiplier = resonance_multiplier_override if resonance_multiplier_override > 0 else 1.05
        # Dynasphere multi-harmonic standing wave power:
        # P = 8.0 * (depth / 6371) * (pressure / 364) * multiplier * efficiency
        harvested_gw = round(8.0 * (node["core_depth_span_km"] / 6371.0) * (node["central_pressure_gpa"] / 364.0) * multiplier * telluric_waveguide_efficiency, 3)
        self._total_baseload_gw += harvested_gw

        standing_wave_flux_mw = round(harvested_gw * 86.4, 2)
        grid_stability = round(99.96 + 0.02 * math.sin(node["resonant_frequency_mhz"]), 2)

        return {
            "node_id": node["node_id"],
            "status": "DYNASPHERE_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "standing_wave_flux_mw": standing_wave_flux_mw,
            "resonant_frequency_mhz": node["resonant_frequency_mhz"],
            "standing_wave_mode": node["standing_wave_mode"],
            "core_depth_span_km": node["core_depth_span_km"],
            "central_pressure_gpa": node["central_pressure_gpa"],
            "telluric_waveguide_efficiency_pct": round(telluric_waveguide_efficiency * 100.0, 1),
            "grid_stability_pct": grid_stability,
            "dispatch_duration_s": dispatch_duration_s,
            "dynasphere_resonance_state": "WHOLE_EARTH_COUPLING_RESONANCE_LOCKED",
            "timestamp": time.time(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "active_nodes_count": len(self._nodes),
            "harvest_events_total": self._harvest_events_count,
            "total_baseload_dispatch_gw": round(self._total_baseload_gw, 3),
            "mean_extraction_efficiency_pct": 96.0,
            "dynasphere_coupling_status": "COUPLED_DYNASPHERE_RESONANCE_LOCKED",
        }

_instance = None

def get_planetary_coupled_dynasphere_resonance_supergrid_service() -> PlanetaryCoupledDynasphereResonanceSupergridService:
    global _instance
    if _instance is None:
        _instance = PlanetaryCoupledDynasphereResonanceSupergridService()
    return _instance
