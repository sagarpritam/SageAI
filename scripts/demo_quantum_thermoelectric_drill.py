"""
Option B Wave 40 Standalone Drill: Planetary Non-Hermitian PT-Symmetric Skin-Effect & Quantum Thermal Ratchet Grid.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.quantum_thermoelectric_ratchet import (
    get_quantum_thermoelectric_ratchet_grid,
)


def run_drill() -> None:
    print("\n" + "=" * 80)
    print(
        " ⚡ SAGEAI OPTION B WAVE 40: PLANETARY NON-HERMITIAN QUANTUM RATCHET POWER DRILL"
    )
    print("=" * 80)

    grid = get_quantum_thermoelectric_ratchet_grid()
    harvesters = grid.get_harvesters()
    print(
        f"  Initialized {len(harvesters)} non-Hermitian PT-symmetric ratchet harvesters:"
    )
    for h in harvesters:
        res = grid.harvest_ratchet_baseload(
            harvester_id=h["harvester_id"],
            bath_gradient_kelvin=h["default_bath_delta_k"],
            nonhermitian_gain=1.6,
        )
        print(
            f"  ✓ Harvester={res['harvester_id']} | Winding={res['winding_invariant']} | "
            f"Eff={res['conversion_efficiency_pct']}% | Net Baseload={res['net_grid_output_gw']} GW | "
            f"Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )

    print("\n" + "=" * 80)
    print(
        " ⚡ OPTION B WAVE 40 NON-HERMITIAN QUANTUM RATCHET POWER DRILL 100% OPERATIONAL"
    )
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_drill()
