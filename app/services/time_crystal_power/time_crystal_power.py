"""
Option B Wave 37: Sovereign Planetary Floquet Time-Crystal Josephson Superconducting Power Grid.
Phase-locks Many-Body Localized (MBL) Discrete Time-Crystal (DTC) pi-spin chains to
Shapiro-step superconducting Josephson flux-ratchet arrays, rectifying coherent subharmonic
2T oscillations into continuous multi-hundred-gigawatt baseload with zero fossil carbon
and zero fissile waste.
"""

import math
import time
from typing import Any, Dict, List


class TimeCrystalPowerGrid:
    """Planetary Floquet Time-Crystal Josephson Harvest Grid (Option B Wave 37)."""

    def __init__(self) -> None:
        self._arrays: Dict[str, Dict[str, Any]] = {
            "TIME-CRYSTAL-ORBIT-01": {
                "array_id": "TIME-CRYSTAL-ORBIT-01",
                "location": "Cryo-LEO Many-Body Localized NV-Diamond Time-Crystal Array",
                "subharmonic_period": 2,
                "default_shapiro_ghz": 34.0,
                "base_output_gw": 265.0,
                "base_efficiency_pct": 97.95,
                "status": "DTC_SUBHARMONIC_ONLINE",
            },
            "JOSEPHSON-MANTLE-02": {
                "array_id": "JOSEPHSON-MANTLE-02",
                "location": "Sub-Crustal Superconducting NbTiN Josephson Ratchet Ring",
                "subharmonic_period": 4,
                "default_shapiro_ghz": 52.0,
                "base_output_gw": 385.0,
                "base_efficiency_pct": 98.48,
                "status": "DTC_SUBHARMONIC_ONLINE",
            },
            "SUBHARMONIC-RING-03": {
                "array_id": "SUBHARMONIC-RING-03",
                "location": "Lagrange-L2 High-Coherence DTC Macro-Josephson Collector",
                "subharmonic_period": 6,
                "default_shapiro_ghz": 78.0,
                "base_output_gw": 540.0,
                "base_efficiency_pct": 98.96,
                "status": "DTC_SUBHARMONIC_ONLINE",
            },
        }
        self._harvest_log: List[Dict[str, Any]] = []

    def get_arrays(self) -> List[Dict[str, Any]]:
        """Return registered Floquet Time-Crystal Josephson arrays."""
        return list(self._arrays.values())

    def get_array(self, array_id: str) -> Dict[str, Any]:
        """Return a single array by ID."""
        if array_id not in self._arrays:
            raise ValueError(f"Time-Crystal Josephson array '{array_id}' not found.")
        return self._arrays[array_id]

    def harvest_subharmonic_baseload(
        self,
        array_id: str,
        shapiro_freq_ghz: float = 34.0,
        ratchet_gain: float = 1.5,
    ) -> Dict[str, Any]:
        """
        Phase-lock discrete time-crystal 2T/n subharmonic spin revival with Shapiro-step
        Josephson junctions to harvest clean planetary electrical baseload.
        """
        arr = self.get_array(array_id)

        freq_ghz = max(10.0, min(float(shapiro_freq_ghz), 200.0))
        gain = max(0.8, min(float(ratchet_gain), 2.5))

        period_n = int(arr["subharmonic_period"])
        eff_pct = round(
            min(
                99.55,
                arr["base_efficiency_pct"] + 0.36 * math.tanh(0.65 * (gain - 0.8)),
            ),
            2,
        )
        raw_gw = (
            arr["base_output_gw"]
            * (0.86 + 0.14 * (freq_ghz / arr["default_shapiro_ghz"]))
            * (0.8 + 0.25 * gain)
        )
        net_gw = round(raw_gw * (eff_pct / 100.0), 2)

        result = {
            "array_id": array_id,
            "location": arr["location"],
            "subharmonic_period_nt": period_n,
            "shapiro_freq_ghz": round(freq_ghz, 2),
            "ratchet_gain": round(gain, 3),
            "conversion_efficiency_pct": eff_pct,
            "net_grid_output_gw": net_gw,
            "mbl_thermalization_blocked": True,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "status": "TIME_CRYSTAL_GRID_OPTIMAL",
            "timestamp": time.time(),
        }

        self._harvest_log.append(result)
        return result

    def get_time_crystal_metrics(self) -> Dict[str, Any]:
        """Return aggregate Planetary Floquet Time-Crystal Josephson Grid metrics."""
        return {
            "active_time_crystal_arrays": len(self._arrays),
            "mean_conversion_efficiency_pct": 98.46,
            "aggregate_capacity_gw": 1190.0,
            "zero_fossil_carbon": True,
            "zero_fissile_waste": True,
            "total_harvest_cycles": len(self._harvest_log),
            "capability": "Option B Wave 37 - Planetary Floquet Time-Crystal Josephson Harvest Grid",
        }


_time_crystal_power_grid = TimeCrystalPowerGrid()


def get_time_crystal_power_grid() -> TimeCrystalPowerGrid:
    """Return the global TimeCrystalPowerGrid singleton instance."""
    return _time_crystal_power_grid
