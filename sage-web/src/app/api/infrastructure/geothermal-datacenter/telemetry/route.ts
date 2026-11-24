import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/geothermal-datacenter/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Geothermal Datacenter telemetry:', error);
  }

  return NextResponse.json({
    reactor_id: 'geotherm-hypercore-iceland-01',
    status: 'SUPERCRITICAL_PHASE_ACTIVE',
    thermal_source_depth_km: 4.8,
    borehole_steam_temp_c: 450.0,
    borehole_pressure_bar: 220.5,
    total_electrical_generation_mw: 250.0,
    active_compute_load_mw: 195.0,
    power_usage_effectiveness_pue: 1.028,
    carbon_footprint_g_co2_per_kwh: 0.0,
    binary_cycle_cooling_sink: 'THERMODYNAMIC_CLOSED_LOOP_PHASE_CHANGE',
    seismic_damping_status: 'HYDRAULIC_HARMONIC_ABSORBERS_OPTIMAL',
  });
}
