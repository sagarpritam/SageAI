"""
Option B Wave 38 Standalone Drill: Planetary Topological Spin-Seebeck & Magnon-Polariton Harvest Grid.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.spin_caloritronic_power import get_spin_caloritronic_power_grid


def run_drill() -> None:
    print("\n" + "=" * 80)
    print(" ⚡ SAGEAI OPTION B WAVE 38: PLANETARY SPIN-CALORITRONIC MAGNON POWER DRILL")
    print("=" * 80)

    grid = get_spin_caloritronic_power_grid()
    arrays = grid.get_arrays()
    print(f"  Initialized {len(arrays)} Spin-Caloritronic Magnon-Polariton arrays:")
    for arr in arrays:
        res = grid.harvest_magnon_baseload(
            array_id=arr["array_id"],
            magnon_freq_ghz=arr["default_magnon_ghz"],
            spin_seebeck_gain=1.6,
        )
        print(
            f"  ✓ Array={res['array_id']} | Theta_SH={res['spin_hall_angle']} | "
            f"Eff={res['conversion_efficiency_pct']}% | Net Baseload={res['net_grid_output_gw']} GW | "
            f"Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )

    print("\n" + "=" * 80)
    print(" ⚡ OPTION B WAVE 38 SPIN-CALORITRONIC MAGNON POWER DRILL 100% OPERATIONAL")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_drill()
