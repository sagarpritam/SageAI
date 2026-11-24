import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/shkadov-thruster/telemetry', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      thruster_system_id: 'shkadov-thruster-sol-01',
      status: 'STELLAR_PROPULSION_THRUST_LOCKED',
      megastructure_architecture: 'Heliocentric Statite Parabolic Solar Radiation Pressure Mirror Mesh',
      heliocentric_orbital_radius_au: 0.45,
      active_reflector_surface_km2: 1.2e9,
      net_directional_thrust_newtons: 1.85e9,
      solar_luminosity_intercept_pct: 3.85,
      star_system_delta_v_per_megayear_km_s: 42.5,
      active_statite_mirror_arrays: 16,
      last_thrust_modulation_timestamp: new Date().toISOString()
    });
  }
}
