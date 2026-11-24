import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/oneill-cylinder/habitats', {
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
        habitat_id: 'oneill-habitat-alpha-01',
        name: 'Cylinder Alpha: Arcadia Valley',
        location: 'Earth-Moon Lagrange Point L5',
        cylinder_radius_km: 4.0,
        population_capacity: 250000,
        oxygen_partial_pressure_pct: 21.0,
        humidity_pct: 52.4,
        status: 'LIFE_SUPPORT_NOMINAL'
      },
      {
        habitat_id: 'oneill-habitat-beta-02',
        name: 'Cylinder Beta: Borealis Basin',
        location: 'Earth-Moon Lagrange Point L5',
        cylinder_radius_km: 4.0,
        population_capacity: 250000,
        oxygen_partial_pressure_pct: 20.9,
        humidity_pct: 54.1,
        status: 'LIFE_SUPPORT_NOMINAL'
      },
      {
        habitat_id: 'oneill-habitat-gamma-03',
        name: 'Cylinder Gamma: Elysium Grove',
        location: 'Sun-Earth Lagrange Point L4',
        cylinder_radius_km: 4.2,
        population_capacity: 280000,
        oxygen_partial_pressure_pct: 21.1,
        humidity_pct: 51.8,
        status: 'LIFE_SUPPORT_NOMINAL'
      },
      {
        habitat_id: 'oneill-habitat-delta-04',
        name: 'Cylinder Delta: Solaria Rim',
        location: 'Sun-Earth Lagrange Point L4',
        cylinder_radius_km: 4.2,
        population_capacity: 280000,
        oxygen_partial_pressure_pct: 21.0,
        humidity_pct: 53.0,
        status: 'LIFE_SUPPORT_NOMINAL'
      }
    ]);
  }
}
