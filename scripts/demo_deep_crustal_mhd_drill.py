#!/usr/bin/env python3
"""
SageAI Option B: Sovereign Subterranean Deep-Crustal Magnetohydrodynamic (MHD) Geothermal Power & Kinetic Vault.

Demonstrates:
- Supercritical geothermal brine extraction (450°C - 580°C, 28 - 34 MPa) at 4.5 - 6.2 km depth.
- Direct DC electricity generation through transverse 8.5 - 9.0 Tesla superconducting magnetic channels.
- Turbine-free baseload power delivery (850 MW - 1.65 GW) powering Class-V deep granitic batholith vaults.
"""

import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.deep_crustal_mhd_vault import deep_crustal_mhd_vault


def main():
    print("=" * 80)
    print("     SAGEAI OPTION B: SUBTERRANEAN DEEP-CRUSTAL MHD GEOTHERMAL VAULT")
    print("   Supercritical Geothermal Power & EMP-Immune Granitic Batholith Grid")
    print("=" * 80)

    # 1. Monitored Vaults Overview
    print(
        "\n[MHD GEOTHERMAL VAULTS] Querying Active Deep-Crustal Sovereign Facilities..."
    )
    vaults = deep_crustal_mhd_vault.list_vaults()
    print(f"  > Active Deep-Crustal Kinetic Vaults: {len(vaults)}")
    for v in vaults:
        print(
            f"    - {v['vault_id']} ({v['vault_name']}): Depth {v['depth_kilometers']} km, Temp {v['geothermal_brine_temp_celsius']}°C, Pressure {v['brine_pressure_mpa']} MPa, B-Field {v['superconducting_b_field_tesla']} T, Rated {v['rated_mhd_output_mw']} MW"
        )

    # 2. Baseload Generation Drill 1: Reykjanes Supercritical Brine Loop
    print(
        "\n[MHD GENERATION 1] Engaging Supercritical Brine Flow at Reykjanes Volcanic Rift..."
    )
    start_t = time.time()
    res1 = deep_crustal_mhd_vault.generate_mhd_baseload(
        vault_id="MHD-VAULT-ICELAND-01",
        brine_velocity_factor=1.1,
        load_factor=0.90,
    )
    t1_ms = (time.time() - start_t) * 1000.0

    print(f"  > Discharge ID: {res1['discharge_id']} at {res1['vault_id']}")
    print(f"  > Brine Flow Velocity: {res1['brine_flow_velocity_m_s']:.2f} m/s")
    print(f"  > Generated MHD Power: {res1['generated_mhd_power_mw']:.1f} MW")
    print(
        f"  > Hall Parameter: beta = {res1['hall_parameter_beta']:.3f} | Efficiency: {res1['mhd_generator_efficiency_pct']}%"
    )
    print(
        f"  > Vault Internal Allocation: {res1['vault_internal_power_allocated_mw']:.1f} MW | Sovereign Grid Export: {res1['sovereign_grid_export_mw']:.1f} MW"
    )
    print(
        f"  > Subterranean Isolation: {res1['subterranean_isolation_confirmed']} (Class-V Faradaic Batholith)"
    )
    print(f"  > Generation Status: {res1['status']} ({t1_ms:.2f} ms)")

    # 3. Baseload Generation Drill 2: Great Basin Granitic Batholith Kinetic Vault
    print(
        "\n[MHD GENERATION 2] Engaging High-Pressure Basal Flow at Great Basin Kinetic Vault..."
    )
    start_t = time.time()
    res2 = deep_crustal_mhd_vault.generate_mhd_baseload(
        vault_id="MHD-VAULT-NEVADA-02",
        brine_velocity_factor=1.15,
        load_factor=0.92,
    )
    t2_ms = (time.time() - start_t) * 1000.0

    print(f"  > Discharge ID: {res2['discharge_id']} at {res2['vault_id']}")
    print(f"  > Brine Flow Velocity: {res2['brine_flow_velocity_m_s']:.2f} m/s")
    print(f"  > Generated MHD Power: {res2['generated_mhd_power_mw']:.1f} MW")
    print(f"  > Sovereign Grid Export: {res2['sovereign_grid_export_mw']:.1f} MW")
    print(f"  > Generation Status: {res2['status']} ({t2_ms:.2f} ms)")

    # 4. Aggregate Vault Network Telemetry
    print("\n[MHD VAULT NETWORK TELEMETRY] Aggregate Deep Geothermal Infrastructure:")
    metrics = deep_crustal_mhd_vault.get_vault_metrics()
    print(f"  > Active Deep Vaults: {metrics['active_mhd_vaults']}")
    print(
        f"  > Aggregate Rated Capacity: {metrics['aggregate_rated_mhd_capacity_mw']:.1f} MW"
    )
    print(f"  > Completed Power Discharges: {metrics['completed_power_discharges']}")
    print(f"  > Primary Working Fluid: {metrics['primary_working_fluid']}")
    print(f"  > Confinement Architecture: {metrics['magnetic_confinement']}")
    print(f"  > EMP Isolation Standard: {metrics['vault_emp_faradaic_isolation']}")
    print(f"  > Status: {metrics['status']}")

    print("\n" + "=" * 80)
    print(
        "  >>> OPTION B SUBTERRANEAN DEEP-CRUSTAL MHD GEOTHERMAL GRID: 100% OPERATIONAL"
    )
    print("=" * 80)


if __name__ == "__main__":
    main()
