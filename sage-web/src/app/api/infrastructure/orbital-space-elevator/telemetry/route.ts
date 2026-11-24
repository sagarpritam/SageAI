import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/orbital-space-elevator/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Orbital Space Elevator telemetry:', error);
  }

  return NextResponse.json({
    tether_system_id: 'equatorial-cnt-space-elevator-01',
    status: 'TETHER_DYNAMIC_TENSION_STABLE',
    tether_length_km: 36000.0,
    material_composition: 'Continuous Carbon Nanotube / Boron Nitride Nanoribbon',
    tensile_strength_gigapascals: 130.0,
    payload_capacity_tons_per_day: 500.0,
    climber_cruise_speed_kmh: 450.0,
    geostationary_counterweight_mass_kt: 1500.0,
    cost_reduction_over_rocketry_pct: 99.2,
    active_climber_carriages: 6,
    last_transit_hoist_timestamp: new Date().toISOString(),
  });
}
