import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/fusion-tokamak/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Fusion Tokamak telemetry:', error);
  }

  return NextResponse.json({
    reactor_id: 'fusion-tokamak-hypercore-01',
    status: 'STEADY_STATE_BURNING_PLASMA_ACTIVE',
    plasma_core_temp_million_c: 145.0,
    confinement_time_tau_s: 4.85,
    magnetic_toroidal_field_tesla: 13.5,
    fusion_gain_q_factor: 14.2,
    total_thermal_generation_mw: 750.0,
    net_electrical_output_mw: 520.0,
    active_datacenter_load_mw: 420.0,
    cooling_water_loop: 'CLOSED_LOOP_TRITIUM_HEAT_EXCHANGER',
    power_usage_effectiveness_pue: 1.018,
    last_modulation_timestamp: new Date().toISOString(),
  });
}
