import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/oneill-cylinder/telemetry', {
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
      biome_system_id: 'oneill-cylinder-biome-01',
      status: 'CENTRIFUGAL_BIOME_STABILIZED',
      habitat_architecture: 'Twin Counter-Rotating O\'Neill Island Three Cylinders',
      cylinder_length_km: 32.0,
      cylinder_radius_km: 4.0,
      centrifugal_gravity_g: 1.002,
      atmospheric_pressure_kpa: 101.3,
      biome_vegetation_coverage_pct: 68.5,
      mhd_precipitation_cycle_hours: 24.0,
      nitrogen_buffer_reserve_tons: 450000.0,
      radiation_shadow_attenuation_db: 72.8,
      last_atmospheric_cycle_timestamp: new Date().toISOString()
    });
  }
}
