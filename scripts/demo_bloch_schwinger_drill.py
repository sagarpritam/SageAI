"""
Standalone Verification Drill for Option B Wave 36:
Sovereign Planetary Topological Floquet-Bloch Photonic Cavity Power Grid.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.bloch_schwinger_power.bloch_schwinger_power import (
    get_bloch_schwinger_power_grid,
)


def main() -> None:
    print("\n" + "=" * 80)
    print(" ⚡ SAGEAI OPTION B WAVE 36: PLANETARY FLOQUET-BLOCH PHOTONIC POWER DRILL")
    print("=" * 80)

    grid = get_bloch_schwinger_power_grid()
    cavities = grid.get_cavities()
    print(f"  Initialized {len(cavities)} Floquet-Bloch topological photonic cavities:")

    for cav in cavities:
        res = grid.harvest_floquet_baseload(
            cav["cavity_id"],
            floquet_drive_thz=cav["default_drive_thz"],
            edge_rectifier_gain=1.5,
        )
        print(
            f"  ✓ Cavity={res['cavity_id']} | Chern={res['chern_invariant']} | Eff={res['conversion_efficiency_pct']}% | Net Baseload={res['net_grid_output_gw']} GW | Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )
        assert res["status"] == "FLOQUET_BLOCH_OPTIMAL"
        assert res["zero_fossil_carbon"] is True
        assert res["zero_fissile_waste"] is True
        assert res["net_grid_output_gw"] > 300.0

    print("\n" + "=" * 80)
    print(" ⚡ OPTION B WAVE 36 FLOQUET-BLOCH PHOTONIC POWER DRILL 100% OPERATIONAL")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
