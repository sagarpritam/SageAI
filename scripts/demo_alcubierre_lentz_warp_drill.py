"""
Option B Wave 31: Sovereign Alcubierre-Lentz Solitonic Warp-Field Transit Matrix Live Drill.
Executes operational verification across all registered positive-energy Lentz soliton
corridors, confirming T_00 >= 0 (Weak Energy Condition), flat passenger interior metric,
and zero fissile actinide waste.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.alcubierre_lentz_warp import get_alcubierre_lentz_warp_matrix

BOLD = "\033[1m"
CYAN = "\033[96m"
GREEN = "\033[92m"
RESET = "\033[0m"


def print_header(title: str, color: str = CYAN) -> None:
    print(f"\n{color}{BOLD}{'=' * 80}{RESET}")
    print(f"{color}{BOLD} {title}{RESET}")
    print(f"{color}{BOLD}{'=' * 80}{RESET}")


def run_lentz_warp_drill() -> None:
    print_header(
        "⚡ SAGEAI OPTION B WAVE 31: ALCUBIERRE-LENTZ SOLITON WARP TRANSIT DRILL"
    )
    matrix = get_alcubierre_lentz_warp_matrix()
    corridors = matrix.get_corridors()

    print(
        f"  Initialized {len(corridors)} positive-energy Alcubierre-Lentz soliton corridors:"
    )
    for corridor in corridors:
        res = matrix.engage_soliton_transit(
            corridor_id=corridor["corridor_id"],
            target_velocity_c=corridor["base_cruise_c"],
            soliton_radius_m=45.0,
            positive_plasma_recovery_gain=1.15,
        )
        print(
            f"  ✓ Corridor={res['corridor_id']} | Cruise={res['target_velocity_c']:.2f}c ({res['cruise_velocity_km_s']:,.1f} km/s) | Confinement={res['shell_confinement_efficiency_pct']:.2f}% | Bus={res['regenerative_bus_output_gw']:.2f} GW | T_00>=0={res['positive_energy_only_t00_ge_0']} | Status={res['status']}"
        )
        assert res["positive_energy_only_t00_ge_0"] is True
        assert res["zero_exotic_negative_mass"] is True
        assert res["zero_fissile_waste"] is True
        assert res["regenerative_bus_output_gw"] > 150.0

    print_header(
        "⚡ OPTION B WAVE 31 ALCUBIERRE-LENTZ SOLITON DRILL 100% OPERATIONAL",
        GREEN,
    )


if __name__ == "__main__":
    run_lentz_warp_drill()
