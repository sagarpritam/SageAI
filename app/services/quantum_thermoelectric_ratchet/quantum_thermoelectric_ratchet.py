"""
Option B Wave 40: Planetary Non-Hermitian PT-Symmetric Skin-Effect & Quantum Thermal Ratchet Power Grid.
Synchronizes Hatano-Nelson non-Hermitian skin-effect waveguides, PT-symmetric whispering-gallery
cavities, and chiral quantum Brownian Josephson thermal ratchets into multi-hundred-gigawatt
continuous clean baseload with zero fossil carbon and zero fissile waste.
"""

import math
import time
from typing import Any, Dict, List


class QuantumThermoelectricRatchetGrid:
    """Planetary Non-Hermitian Skin-Effect & Quantum Thermal Ratchet Grid (Option B Wave 40)."""

    def __init__(self) -> None:
        self._harvesters: Dict[str, Dict[str, Any]] = {
            "NONHERM-SKIN-ARRAY-01": {
                "harvester_id": "NONHERM-SKIN-ARRAY-01",
                "location": "Sub-Marine Hatano-Nelson Non-Hermitian Skin-Effect Rectifier Ring",
                "default_bath_delta_k": 420.0,
                "winding_invariant": 4,
                "base_output_gw": 298.0,
                "base_efficiency_pct": 98.24,
                "status": "SKIN_EFFECT_COHERENT",
            },
            "PT-SYMMETRIC-CAVITY-02": {
                "harvester_id": "PT-SYMMETRIC-CAVITY-02",
                "location": "Equatorial PT-Symmetric Whispering-Gallery Harvester",
                "default_bath_delta_k": 580.0,
                "winding_invariant": 6,
                "base_output_gw": 434.0,
                "base_efficiency_pct": 98.74,
                "status": "SKIN_EFFECT_COHERENT",
            },
            "QUANTUM-RATCHET-L2-03": {
                "harvester_id": "QUANTUM-RATCHET-L2-03",
                "location": "Sun-Earth L2 Chiral Quantum Brownian Josephson Ratchet Matrix",
                "default_bath_delta_k": 760.0,
                "winding_invariant": 8,
                "base_output_gw": 605.0,
                "base_efficiency_pct": 99.18,
                "status": "SKIN_EFFECT_COHERENT",
            },
        }
        self._harvest_log: List[Dict[str, Any]] = []

    def get_harvesters(self) -> List[Dict[str, Any]]:
        """Return registered non-Hermitian skin-effect ratchet harvesters."""
        return list(self._harvesters.values())

    def get_harvester(self, harvester_id: str) -> Dict[str, Any]:
        """Return a single ratchet harvester by ID."""
        if harvester_id not in self._harvesters:
            raise ValueError(
                f"Quantum thermoelectric ratchet harvester '{harvester_id}' not found."
            )
        return self._harvesters[harvester_id]

    def harvest_ratchet_baseload(
        self,
        harvester_id: str,
        bath_gradient_kelvin: float = 420.0,
        nonhermitian_gain: float = 1.6,
    ) -> Dict[str, Any]:
        """
        Phase-lock non-Hermitian skin-effect rectification and chiral quantum ratchet
        fluxes into continuous clean electrical baseload.
        """
        harv = self.get_harvester(harvester_id)

        delta_k = max(50.0, min(float(bath_gradient_kelvin), 2500.0))
        gain = max(0.8, min(float(nonhermitian_gain), 2.5))

        eff_pct = round(
            min(
                99.72,
                harv["base_efficiency_pct"] + 0.34 * math.tanh(0.68 * (gain - 0.8)),
            ),
            2,
        )
        raw_gw = (
            harv["base_output_gw"]
            * (0.86 + 0.14 * (delta_k / harv["default_bath_delta_k"]))
            * (0.8 + 0.25 * gain)
        )
        net_gw = round(raw_gw * (eff_pct / 100.0), 2)

        result = {
            "harvester_id": harvester_id,
            "location": harv["location"],
            "winding_invariant": harv["winding_invariant"],
            "bath_gradient_kelvin": round(delta_k, 1),
            "nonhermitian_gain": round(gain, 3),
            "conversion_efficiency_pct": eff_pct,
            "net_grid_output_gw": net_gw,
            "pt_exceptional_point_locked": True,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "status": "THERMOELECTRIC_RATCHET_OPTIMAL",
            "timestamp": time.time(),
        }

        self._harvest_log.append(result)
        return result

    def get_ratchet_metrics(self) -> Dict[str, Any]:
        """Return aggregate Planetary Quantum Thermoelectric Ratchet Grid metrics."""
        return {
            "active_ratchet_harvesters": len(self._harvesters),
            "mean_conversion_efficiency_pct": 98.72,
            "aggregate_capacity_gw": 1337.0,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "total_harvest_cycles": len(self._harvest_log),
            "capability": "Option B Wave 40 - Planetary Non-Hermitian PT-Symmetric Quantum Ratchet Grid",
        }


_quantum_thermoelectric_ratchet_grid = QuantumThermoelectricRatchetGrid()


def get_quantum_thermoelectric_ratchet_grid() -> QuantumThermoelectricRatchetGrid:
    """Return singleton QuantumThermoelectricRatchetGrid instance."""
    return _quantum_thermoelectric_ratchet_grid
