"""
Option B Wave 39: Planetary Topological Berry-Curvature & Nonlinear Hall Harvest Grid.
Synchronizes Moire bilayer graphene, broken-inversion Weyl TaAs dipoles, and Kagome
Chern-magnet Berry-curvature arrays, rectifying topological anomalous Hall & Nernst
currents into multi-hundred-gigawatt continuous baseload with zero fossil carbon and zero waste.
"""

import math
import time
from typing import Any, Dict, List


class BerryCurvaturePowerGrid:
    """Planetary Berry-Curvature & Nonlinear Hall Harvest Grid (Option B Wave 39)."""

    def __init__(self) -> None:
        self._arrays: Dict[str, Dict[str, Any]] = {
            "BERRY-MOIRE-BLG-01": {
                "array_id": "BERRY-MOIRE-BLG-01",
                "location": "Sub-Crustal Moire Bilayer Graphene Berry Dipole Collector",
                "default_pump_thz": 1.8,
                "berry_dipole_nm": 4.2,
                "base_output_gw": 290.0,
                "base_efficiency_pct": 98.18,
                "status": "BERRY_DIPOLE_COHERENT",
            },
            "WEYL-TAAS-DIPOLE-02": {
                "array_id": "WEYL-TAAS-DIPOLE-02",
                "location": "Cryo-LEO Weyl TaAs Nonlinear Quantum Hall Rectifier Ring",
                "default_pump_thz": 3.2,
                "berry_dipole_nm": 6.8,
                "base_output_gw": 420.0,
                "base_efficiency_pct": 98.66,
                "status": "BERRY_DIPOLE_COHERENT",
            },
            "KAGOME-CHERN-HARVEST-03": {
                "array_id": "KAGOME-CHERN-HARVEST-03",
                "location": "Lagrange-L1 Kagome Chern-Magnet Anomalous Nernst Array",
                "default_pump_thz": 5.4,
                "berry_dipole_nm": 9.4,
                "base_output_gw": 585.0,
                "base_efficiency_pct": 99.12,
                "status": "BERRY_DIPOLE_COHERENT",
            },
        }
        self._harvest_log: List[Dict[str, Any]] = []

    def get_arrays(self) -> List[Dict[str, Any]]:
        """Return registered Berry-curvature nonlinear Hall harvest arrays."""
        return list(self._arrays.values())

    def get_array(self, array_id: str) -> Dict[str, Any]:
        """Return a single Berry-curvature array by ID."""
        if array_id not in self._arrays:
            raise ValueError(f"Berry-curvature array '{array_id}' not found.")
        return self._arrays[array_id]

    def harvest_berry_baseload(
        self,
        array_id: str,
        terahertz_pump_thz: float = 1.8,
        berry_dipole_gain: float = 1.5,
    ) -> Dict[str, Any]:
        """
        Phase-lock topological Berry-curvature dipole rectifiers to generate
        continuous clean electrical baseload via nonlinear quantum Hall transport.
        """
        arr = self.get_array(array_id)

        pump_thz = max(0.5, min(float(terahertz_pump_thz), 25.0))
        gain = max(0.8, min(float(berry_dipole_gain), 2.5))

        eff_pct = round(
            min(
                99.65,
                arr["base_efficiency_pct"] + 0.35 * math.tanh(0.65 * (gain - 0.8)),
            ),
            2,
        )
        raw_gw = (
            arr["base_output_gw"]
            * (0.86 + 0.14 * (pump_thz / arr["default_pump_thz"]))
            * (0.8 + 0.25 * gain)
        )
        net_gw = round(raw_gw * (eff_pct / 100.0), 2)

        result = {
            "array_id": array_id,
            "location": arr["location"],
            "berry_dipole_nm": arr["berry_dipole_nm"],
            "terahertz_pump_thz": round(pump_thz, 2),
            "berry_dipole_gain": round(gain, 3),
            "conversion_efficiency_pct": eff_pct,
            "net_grid_output_gw": net_gw,
            "nonlinear_hall_locked": True,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "status": "BERRY_CURVATURE_GRID_OPTIMAL",
            "timestamp": time.time(),
        }

        self._harvest_log.append(result)
        return result

    def get_berry_curvature_metrics(self) -> Dict[str, Any]:
        """Return aggregate Planetary Berry-Curvature & Nonlinear Hall Grid metrics."""
        return {
            "active_berry_arrays": len(self._arrays),
            "mean_conversion_efficiency_pct": 98.65,
            "aggregate_capacity_gw": 1295.0,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "total_harvest_cycles": len(self._harvest_log),
            "capability": "Option B Wave 39 - Planetary Berry-Curvature & Nonlinear Hall Harvest Grid",
        }


_berry_curvature_power_grid = BerryCurvaturePowerGrid()


def get_berry_curvature_power_grid() -> BerryCurvaturePowerGrid:
    """Return the global BerryCurvaturePowerGrid singleton instance."""
    return _berry_curvature_power_grid
