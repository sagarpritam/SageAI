import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/galactic-hypergrid/nodes', {
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
        node_id: 'SGR-RING-01',
        node_name: 'Inner Ergosphere Dynamo Alpha',
        distance_rs: 1.25,
        flux_exawatts: 26500.0,
        plasma_beta: 0.042,
        status: 'HARVESTING_OPTIMAL'
      },
      {
        node_id: 'SGR-RING-02',
        node_name: 'Relativistic Jet Tap Beta',
        distance_rs: 2.10,
        flux_exawatts: 23000.0,
        plasma_beta: 0.051,
        status: 'HARVESTING_OPTIMAL'
      },
      {
        node_id: 'SGR-RELAY-03',
        node_name: 'Orion Trunk Waveguide Concentrator',
        distance_rs: 15.0,
        flux_exawatts: 18500.0,
        plasma_beta: 0.019,
        status: 'RELAY_SYNCHRONIZED'
      },
      {
        node_id: 'SGR-RELAY-04',
        node_name: 'Perseus Deep Conduit Node',
        distance_rs: 32.5,
        flux_exawatts: 16500.0,
        plasma_beta: 0.023,
        status: 'RELAY_SYNCHRONIZED'
      }
    ]);
  }
}
