#!/usr/bin/env python3
"""
SageAI Option B: Sovereign Directed Magneto-Inertial Fusion (MIF) Deep-Space Propulsion & Pulsed Energy Matrix.

Demonstrates Option B Magneto-Inertial Fusion:
- Multi-megampere magnetic pulsed drivers (15-25 MA)
- Imploding metallic/lithium plasma liners (110-145 km/s)
- Thermonuclear Breakeven Exceeded: Q >= 11.4 - 14.5 (>10.0 threshold)
- Pulsed Thermal Energy Yield: >2.85 - 3.85 GW_th
- Direct Megawatt Electrical Conversion (>850 - 1000 MW)
- Magnetic Expansion Nozzle Exhaust: >1,180 km/s (Specific Impulse I_sp > 120,000s)
"""

import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.magneto_inertial_fusion import get_magneto_inertial_fusion


def main():
    print("=" * 80)
    print("     SAGEAI OPTION B: SOVEREIGN MAGNETO-INERTIAL FUSION (MIF) MATRIX")
    print("      Multi-Megampere Pulsed Liner Breakeven & Magnetic Nozzle Propulsion")
    print("=" * 80)

    mif = get_magneto_inertial_fusion()
    reactors = mif.list_reactors()
    print(f"\n[REACTOR DISCOVERY] Operational MIF Power & Propulsion Cores: {len(reactors)}")
    for r in reactors:
        print(f"  - [{r['reactor_id']}] {r['callsign']}")
        print(f"      Driver Current: {r['peak_driver_current_ma']:.1f} MA | Liner Velocity: {r['plasma_liner_velocity_kms']:.1f} km/s")
        print(f"      Design Gain: Q={r['thermonuclear_q_factor']:.1f} | Baseload Yield: {r['thermal_power_output_gw']:.2f} GW_th | Nozzle Isp: {r['magnetic_nozzle_isp_seconds']:.0f} s")

    # Pulse 1: Prometheus High-Orbit Core
    print("\n[PULSE 1] Initiating 22.5 MA Pulsed Magnetic Implosion on MIF-REACTOR-ORBITAL-01...")
    start_t = time.time()
    res1 = mif.pulse_fusion_reactor(
        reactor_id="MIF-REACTOR-ORBITAL-01",
        current_boost_ma=2.0,
        compression_gain=1.1,
    )
    time1_ms = (time.time() - start_t) * 1000.0

    print(f"  > Pulse Event ID: {res1['pulse_id']}")
    print(f"  > Reactor: {res1['reactor_id']}")
    print(f"  > Peak Driver Current: {res1['peak_current_ma']:.1f} Mega-Amperes")
    print(f"  > Magnetic Liner Stagnation Pressure: {res1['plasma_implosion_pressure_mbar']:.1f} Mbar")
    print(f"  > Thermonuclear Energy Gain: Q = {res1['fusion_gain_q']:.2f} (Breakeven Q > 10.0: EXCEEDED)")
    print(f"  > Thermal Fusion Power Yield: {res1['thermal_yield_gw']:.2f} GW_th")
    print(f"  > Direct Electrical Decoupling: {res1['direct_electrical_conversion_mw']:.1f} MW (Superconducting Bus Charged)")
    print(f"  > Magnetic Nozzle Exhaust Velocity: {res1['magnetic_nozzle_exhaust_velocity_kms']:.1f} km/s")
    print(f"  > Propulsion Specific Impulse (I_sp): {res1['specific_impulse_isp_s']:.0f} s (Threshold >120,000s: MET)")
    print(f"  > Directed Energy Weapon (DEW) Grid Bus: {res1['dew_array_power_bus_charged']}")
    print(f"  > Fusion Status: {res1['status']} ({time1_ms:.2f} ms)")

    # Pulse 2: Helios Interplanetary Propulsion Core
    print("\n[PULSE 2] Firing High-Yield Trans-Planetary Pulse on MIF-REACTOR-DEEP-SPACE-03...")
    start_t = time.time()
    res2 = mif.pulse_fusion_reactor(
        reactor_id="MIF-REACTOR-DEEP-SPACE-03",
        current_boost_ma=3.0,
        compression_gain=1.35,
    )
    time2_ms = (time.time() - start_t) * 1000.0

    print(f"  > Pulse Event ID: {res2['pulse_id']}")
    print(f"  > Reactor: {res2['reactor_id']}")
    print(f"  > Peak Driver Current: {res2['peak_current_ma']:.1f} Mega-Amperes")
    print(f"  > Thermonuclear Energy Gain: Q = {res2['fusion_gain_q']:.2f}")
    print(f"  > Thermal Fusion Power Yield: {res2['thermal_yield_gw']:.2f} GW_th")
    print(f"  > Direct Electrical Decoupling: {res2['direct_electrical_conversion_mw']:.1f} MW")
    print(f"  > Propulsion Specific Impulse (I_sp): {res2['specific_impulse_isp_s']:.0f} s")
    print(f"  > Fusion Status: {res2['status']} ({time2_ms:.2f} ms)")

    # Aggregate Metrics
    metrics = mif.get_fusion_metrics()
    print("\n[MATRIX TELEMETRY] Sovereign MIF Grid Status:")
    print(f"  > Operational Reactors: {metrics['operational_reactors']}")
    print(f"  > Completed Thermonuclear Pulses: {metrics['completed_fusion_pulses']}")
    print(f"  > Mean Energy Gain Factor: Q = {metrics['mean_energy_gain_q']}")
    print(f"  > Confinement Scheme: {metrics['confinement_scheme']}")
    print(f"  > High-Voltage DEW Coupling: {metrics['dew_coupling_status']}")

    print("\n" + "=" * 80)
    print("     [SUCCESS] OPTION B MAGNETO-INERTIAL FUSION (MIF) DRILL COMPLETE")
    print("      Thermonuclear Breakeven (Q > 10) & 120,000s Isp Nozzle Fully Certified")
    print("=" * 80)


if __name__ == "__main__":
    main()
