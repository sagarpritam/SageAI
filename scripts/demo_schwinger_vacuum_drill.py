"""
Option B Wave 30: Sovereign Zero-Point Schwinger-Vacua Pair-Production Cascade Harvester Live Drill.
Executes operational verification across all registered Schwinger critical-field cavities
and Breit-Wheeler Cyclotron-Bragg inductive energy recovery units.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.schwinger_vacuum_harvester import get_schwinger_vacuum_harvester

BOLD = "\033[1m"
CYAN = "\033[96m"
GREEN = "\033[92m"
RESET = "\033[0m"


def print_header(title: str, color: str = CYAN) -> None:
    print(f"\n{color}{BOLD}{'=' * 80}{RESET}")
    print(f"{color}{BOLD} {title}{RESET}")
    print(f"{color}{BOLD}{'=' * 80}{RESET}")


def run_schwinger_drill() -> None:
    print_header(
        "⚡ SAGEAI OPTION B WAVE 30: SCHWINGER-VACUA PAIR-PRODUCTION HARVESTER DRILL"
    )
    harvester = get_schwinger_vacuum_harvester()
    cavities = harvester.get_cavities()

    print(
        f"  Initialized {len(cavities)} Schwinger critical-field pair-production cavities:"
    )
    for cavity in cavities:
        res = harvester.harvest_pair_cascade(
            cavity_id=cavity["cavity_id"],
            field_ratio_e_ec=cavity["base_field_ratio_e_ec"],
            beam_pulse_hz=120.0,
            recovery_coupling_gain=1.15,
        )
        print(
            f"  ✓ Cavity={res['cavity_id']} | E_eff={res['effective_field_v_m']:.3e} V/m | Bragg Recovery={res['cyclotron_bragg_recovery_pct']:.2f}% | Net Electrical={res['net_electrical_output_gw']:.2f} GW | Zero Waste={res['zero_fissile_waste']} | Status={res['status']}"
        )
        assert res["zero_fissile_waste"] is True
        assert res["net_electrical_output_gw"] > 155.0

    print_header(
        "⚡ OPTION B WAVE 30 SCHWINGER VACUUM HARVESTER DRILL 100% OPERATIONAL",
        GREEN,
    )


if __name__ == "__main__":
    run_schwinger_drill()
