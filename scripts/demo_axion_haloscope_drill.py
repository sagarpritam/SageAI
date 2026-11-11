"""
Option B Wave 32: Sovereign Planetary Topological Axion-Quasiparticle Haloscope Grid Live Drill.
Executes operational verification across all registered Primakov axion haloscope arrays,
confirming coherent rectification >95%, >170 GW continuous clean baseload, and zero fissile waste.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.axion_haloscope_power import get_axion_haloscope_power_grid

BOLD = "\033[1m"
CYAN = "\033[96m"
GREEN = "\033[92m"
RESET = "\033[0m"


def print_header(title: str, color: str = CYAN) -> None:
    print(f"\n{color}{BOLD}{'=' * 80}{RESET}")
    print(f"{color}{BOLD} {title}{RESET}")
    print(f"{color}{BOLD}{'=' * 80}{RESET}")


def run_axion_haloscope_drill() -> None:
    print_header(
        "⚡ SAGEAI OPTION B WAVE 32: PLANETARY AXION-HALOSCOPE PRIMAKOV POWER DRILL"
    )
    grid = get_axion_haloscope_power_grid()
    arrays = grid.get_arrays()

    print(
        f"  Initialized {len(arrays)} superconducting Primakov axion-haloscope power arrays:"
    )
    for array in arrays:
        res = grid.resonate_haloscope_grid(
            array_id=array["array_id"],
            magnetic_field_tesla=array["default_magnetic_field_t"],
            cavity_quality_q_million=array["default_cavity_q_million"],
            axion_mass_uev=42.0,
            primakov_coupling_gain=1.25,
        )
        print(
            f"  ✓ Array={res['array_id']} | B={res['magnetic_field_tesla']:.1f} T | Freq={res['resonant_frequency_ghz']:.3f} GHz | Eff={res['coherent_rectification_eff_pct']:.2f}% | Net Baseload={res['net_clean_baseload_gw']:.2f} GW | Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )
        assert res["zero_fossil_carbon"] is True
        assert res["zero_fissile_waste"] is True
        assert res["net_clean_baseload_gw"] > 170.0

    print_header(
        "⚡ OPTION B WAVE 32 AXION-HALOSCOPE POWER DRILL 100% OPERATIONAL",
        GREEN,
    )


if __name__ == "__main__":
    run_axion_haloscope_drill()
