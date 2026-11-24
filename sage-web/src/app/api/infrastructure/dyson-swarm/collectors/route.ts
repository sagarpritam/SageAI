import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/dyson-swarm/collectors', {
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
        collector_id: 'swarm-ring-inner-01',
        name: 'Inner Mercury Perihelion Ring Alpha',
        location: '0.28 AU Circumsolar Orbit',
        power_capacity_petawatts: 35.0,
        rectenna_target: 'Sahara Desert Planetary Rectenna',
        frequency_ghz: 140.0,
        efficiency_pct: 95.1,
        status: 'BEAMING_CONTINUOUS'
      },
      {
        collector_id: 'swarm-ring-mid-02',
        name: 'Mid-Sol Polar Arc Beta',
        location: '0.32 AU Inclined 45° Solar Arc',
        power_capacity_petawatts: 30.0,
        rectenna_target: 'Atacama High Rectenna Grid',
        frequency_ghz: 140.0,
        efficiency_pct: 94.8,
        status: 'BEAMING_CONTINUOUS'
      },
      {
        collector_id: 'swarm-ring-outer-03',
        name: 'Outer Venus Synchronous Arc Gamma',
        location: '0.38 AU Circumsolar Orbit',
        power_capacity_petawatts: 28.0,
        rectenna_target: 'Lunar South Pole Cryo Rectenna',
        frequency_ghz: 140.0,
        efficiency_pct: 94.3,
        status: 'BEAMING_CONTINUOUS'
      },
      {
        collector_id: 'swarm-ring-polar-04',
        name: 'Heliographic North Polar Ring Delta',
        location: '0.30 AU Solar Polar Retrograde',
        power_capacity_petawatts: 27.0,
        rectenna_target: 'Orbital Habitat L5 Power Rectenna',
        frequency_ghz: 140.0,
        efficiency_pct: 94.2,
        status: 'BEAMING_CONTINUOUS'
      }
    ]);
  }
}
