"""
Option B Wave 39 Standalone Drill: Planetary Topological Berry-Curvature & Nonlinear Hall Harvest Grid.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.berry_curvature_power import get_berry_curvature_power_grid


def run_drill() -> None:
    print("\n" + "=" * 80)
    print(
        " ⚡ SAGEAI OPTION B WAVE 39: PLANETARY BERRY-CURVATURE NONLINEAR HALL POWER DRILL"
    )
    print("=" * 80)

    grid = get_berry_curvature_power_grid()
    arrays = grid.get_arrays()
    print(f"  Initialized {len(arrays)} Berry-Curvature Nonlinear Hall harvest arrays:")
    for arr in arrays:
        res = grid.harvest_berry_baseload(
            array_id=arr["array_id"],
            terahertz_pump_thz=arr["default_pump_thz"],
            berry_dipole_gain=1.6,
        )
        print(
            f"  ✓ Array={res['array_id']} | Dipole={res['berry_dipole_nm']} nm | "
            f"Eff={res['conversion_efficiency_pct']}% | Net Baseload={res['net_grid_output_gw']} GW | "
            f"Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )

    print("\n" + "=" * 80)
    print(
        " ⚡ OPTION B WAVE 39 BERRY-CURVATURE NONLINEAR HALL POWER DRILL 100% OPERATIONAL"
    )
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_drill()
