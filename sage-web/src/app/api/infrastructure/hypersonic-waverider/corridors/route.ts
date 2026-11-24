import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/hypersonic-waverider/corridors', {
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
        corridor_id: 'waverider-corridor-tokyo-frankfurt-01',
        name: 'Trans-Polar Hyper-Express 01',
        origin: 'Tokyo Spaceport (Haneda Offshore)',
        destination: 'Frankfurt Logistics Space Hub',
        distance_km: 9350.0,
        flight_time_minutes: 38.5,
        assigned_airframe: 'WaveRider Valkyrie-01',
        status: 'CORRIDOR_GREEN'
      },
      {
        corridor_id: 'waverider-corridor-sanfrancisco-singapore-02',
        name: 'Pacific Sub-Orbital Transceiver Line 02',
        origin: 'Mojave Spaceport Base',
        destination: 'Singapore Changi Space Gateway',
        distance_km: 13600.0,
        flight_time_minutes: 44.2,
        assigned_airframe: 'WaveRider Hyperion-04',
        status: 'CORRIDOR_GREEN'
      },
      {
        corridor_id: 'waverider-corridor-london-sydney-03',
        name: 'Great Circle Antipodal Conduit 03',
        origin: 'SaxaVord Spaceport (Shetland)',
        destination: 'Adelaide Orbital Terminal',
        distance_km: 16900.0,
        flight_time_minutes: 48.0,
        assigned_airframe: 'WaveRider Zephyr-07',
        status: 'CORRIDOR_GREEN'
      },
      {
        corridor_id: 'waverider-corridor-dubai-saopaulo-04',
        name: 'South Atlantic Hyper-Arc 04',
        origin: 'Al Maktoum Space Logistics Port',
        destination: 'Alcantara Launch Center (Brazil)',
        distance_km: 11800.0,
        flight_time_minutes: 41.0,
        assigned_airframe: 'WaveRider Boreas-09',
        status: 'CORRIDOR_GREEN'
      }
    ]);
  }
}
