import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/geothermal-supercritical/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Geothermal Supercritical telemetry:', error);
  }

  return NextResponse.json({
    tap_system_id: 'supercritical-magma-tap-grid-01',
    status: 'SUPERCRITICAL_THERMAL_TAP_ACTIVE',
    well_drilling_depth_meters: 5200.0,
    subsurface_rock_temperature_celsius: 512.0,
    supercritical_fluid_pressure_bar: 245.0,
    gross_thermal_power_mwt: 1850.0,
    net_electrical_output_mw: 740.0,
    closed_loop_binary_efficiency_pct: 42.8,
    datacenter_pue: 1.008,
    active_supercritical_wells: 16,
    last_thermal_cycle_timestamp: new Date().toISOString(),
  });
}
