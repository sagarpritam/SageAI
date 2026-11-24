"""
Standalone Drill for Option B Wave 46:
Sovereign Planetary Room-Temperature LK-99 Diamagnetic & Meissner-Levitation Supergrid.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.room_temp_diamagnetic_supergrid import (
    get_room_temp_diamagnetic_supergrid,
)


def run_diamagnetic_supergrid_drill() -> None:
    print("\n" + "=" * 80)
    print(
        " SAGEAI OPTION B WAVE 46: ROOM-TEMPERATURE DIAMAGNETIC & MEISSNER-LEVITATION SUPERGRID"
    )
    print("=" * 80 + "\n")

    sg = get_room_temp_diamagnetic_supergrid()
    arrays = sg.get_arrays()

    for idx, arr in enumerate(arrays, 1):
        print(f"[{idx}/{len(arrays)}] Harvester Array: {arr['array_id']}")
        res = sg.harvest_diamagnetic_baseload(
            array_id=arr["array_id"],
            meissner_field_tesla=arr["default_meissner_field_tesla"],
            levitation_gain=1.6,
        )
        print(
            f"  ✓ Location: {res['location']}\n"
            f"  ✓ Net Grid Output: {res['net_grid_output_gw']:.2f} GW | Efficiency: {res['conversion_efficiency_pct']:.2f}%\n"
            f"  ✓ Coherence: {res['levitation_coherence']} | Residual: {res['meissner_residual']:.4e}\n"
            f"  ✓ Zero Carbon: {res['zero_fossil_carbon']} | Zero Waste: {res['zero_fissile_waste']}\n"
            f"  ✓ Status: {res['status']}\n"
        )

    metrics = sg.get_grid_metrics()
    print("=" * 80)
    print(
        f" PLANETARY DIAMAGNETIC SUPERGRID DRILL COMPLETE: {metrics['total_net_power_gw']:.2f} GW TOTAL HARVESTED"
    )
    print(f" Status: {metrics['supergrid_status']}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_diamagnetic_supergrid_drill()
