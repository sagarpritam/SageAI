import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/shkadov-thruster/mirrors', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json([
      {
        mirror_id: 'mirror-helios-north-01',
        name: 'North Solar Polar Statite Reflector',
        location: 'Heliocentric 0.42 AU North Pole Orbit',
        reflector_area_km2: 300000000.0,
        radiation_thrust_mn: 462.5,
        albedo_reflectivity_pct: 99.98,
        status: 'STATITE_HOVER_NOMINAL'
      },
      {
        mirror_id: 'mirror-helios-south-01',
        name: 'South Solar Polar Statite Reflector',
        location: 'Heliocentric 0.42 AU South Pole Orbit',
        reflector_area_km2: 300000000.0,
        radiation_thrust_mn: 462.5,
        albedo_reflectivity_pct: 99.98,
        status: 'STATITE_HOVER_NOMINAL'
      },
      {
        mirror_id: 'mirror-apex-vector-01',
        name: 'Apex Galactic Vector Attitude Compensator',
        location: 'Heliocentric 0.48 AU Equator Orbit',
        reflector_area_km2: 300000000.0,
        radiation_thrust_mn: 462.5,
        albedo_reflectivity_pct: 99.97,
        status: 'VECTOR_TRIM_ACTIVE'
      },
      {
        mirror_id: 'mirror-antapex-counter-01',
        name: 'Antapex Galactic Drift Stabilizer',
        location: 'Heliocentric 0.48 AU Trailing Lagrange',
        reflector_area_km2: 300000000.0,
        radiation_thrust_mn: 462.5,
        albedo_reflectivity_pct: 99.99,
        status: 'DRIFT_STABILIZATION_LOCKED'
      }
    ]);
  }
}
