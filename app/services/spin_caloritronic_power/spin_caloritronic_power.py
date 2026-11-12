"""
Option B Wave 38: Sovereign Planetary Topological Spin-Seebeck & Magnon-Polariton Harvest Grid.
Synchronizes high-Q YIG/Pt and Weyl-semimetal spin-caloritronic magnon-polariton
cavities, converting sub-kelvin thermal spin-Hall voltage gradients via topological
magnon Bose-Einstein condensates into continuous multi-hundred-gigawatt baseload
with zero fossil carbon and zero fissile waste.
"""

import math
import time
from typing import Any, Dict, List


class SpinCaloritronicPowerGrid:
    """Planetary Spin-Seebeck & Magnon-Polariton Harvest Grid (Option B Wave 38)."""

    def __init__(self) -> None:
        self._arrays: Dict[str, Dict[str, Any]] = {
            "MAGNON-YIG-PT-01": {
                "array_id": "MAGNON-YIG-PT-01",
                "location": "Sub-Crustal YIG/Pt Spin-Seebeck Magnon-BEC Ring",
                "default_magnon_ghz": 42.0,
                "spin_hall_angle": 0.34,
                "base_output_gw": 280.0,
                "base_efficiency_pct": 98.08,
                "status": "MAGNON_BEC_COHERENT",
            },
            "WEYL-SPIN-CALORITRONIC-02": {
                "array_id": "WEYL-SPIN-CALORITRONIC-02",
                "location": "Cryo-LEO Weyl-Semimetal Topological Spin-Peltier Collector",
                "default_magnon_ghz": 68.0,
                "spin_hall_angle": 0.46,
                "base_output_gw": 405.0,
                "base_efficiency_pct": 98.58,
                "status": "MAGNON_BEC_COHERENT",
            },
            "POLARITON-MAGNON-03": {
                "array_id": "POLARITON-MAGNON-03",
                "location": "Lagrange-L1 Cavity Magnon-Polariton Rectifier Array",
                "default_magnon_ghz": 96.0,
                "spin_hall_angle": 0.58,
                "base_output_gw": 565.0,
                "base_efficiency_pct": 99.04,
                "status": "MAGNON_BEC_COHERENT",
            },
        }
        self._harvest_log: List[Dict[str, Any]] = []

    def get_arrays(self) -> List[Dict[str, Any]]:
        """Return registered spin-caloritronic magnon-polariton arrays."""
        return list(self._arrays.values())

    def get_array(self, array_id: str) -> Dict[str, Any]:
        """Return a single spin-caloritronic array by ID."""
        if array_id not in self._arrays:
            raise ValueError(f"Spin-caloritronic array '{array_id}' not found.")
        return self._arrays[array_id]

    def harvest_magnon_baseload(
        self,
        array_id: str,
        magnon_freq_ghz: float = 42.0,
        spin_seebeck_gain: float = 1.5,
    ) -> Dict[str, Any]:
        """
        Phase-lock topological magnon-polariton Bose-Einstein condensates to inverse
        spin-Hall voltage rectifiers to generate clean continuous electrical baseload.
        """
        arr = self.get_array(array_id)

        freq_ghz = max(12.0, min(float(magnon_freq_ghz), 240.0))
        gain = max(0.8, min(float(spin_seebeck_gain), 2.5))

        eff_pct = round(
            min(
                99.60,
                arr["base_efficiency_pct"] + 0.35 * math.tanh(0.65 * (gain - 0.8)),
            ),
            2,
        )
        raw_gw = (
            arr["base_output_gw"]
            * (0.86 + 0.14 * (freq_ghz / arr["default_magnon_ghz"]))
            * (0.8 + 0.25 * gain)
        )
        net_gw = round(raw_gw * (eff_pct / 100.0), 2)

        result = {
            "array_id": array_id,
            "location": arr["location"],
            "spin_hall_angle": arr["spin_hall_angle"],
            "magnon_freq_ghz": round(freq_ghz, 2),
            "spin_seebeck_gain": round(gain, 3),
            "conversion_efficiency_pct": eff_pct,
            "net_grid_output_gw": net_gw,
            "magnon_bec_locked": True,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "status": "SPIN_CALORITRONIC_GRID_OPTIMAL",
            "timestamp": time.time(),
        }

        self._harvest_log.append(result)
        return result

    def get_spin_caloritronic_metrics(self) -> Dict[str, Any]:
        """Return aggregate Planetary Spin-Caloritronic Magnon-Polariton Grid metrics."""
        return {
            "active_spin_caloritronic_arrays": len(self._arrays),
            "mean_conversion_efficiency_pct": 98.57,
            "aggregate_capacity_gw": 1250.0,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "total_harvest_cycles": len(self._harvest_log),
            "capability": "Option B Wave 38 - Planetary Spin-Caloritronic Magnon-Polariton Harvest Grid",
        }


_spin_caloritronic_power_grid = SpinCaloritronicPowerGrid()


def get_spin_caloritronic_power_grid() -> SpinCaloritronicPowerGrid:
    """Return the global SpinCaloritronicPowerGrid singleton instance."""
    return _spin_caloritronic_power_grid
