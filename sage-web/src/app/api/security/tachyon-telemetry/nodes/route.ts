import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/tachyon-telemetry/nodes', {
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
        node_id: 'node-voyager-nexus-01',
        name: 'Voyager Nexus Deep Probe',
        location: 'Heliopause Boundary (120 AU)',
        distance_au: 120.0,
        latency_ms: 0.012,
        fidelity_pct: 99.9997,
        throughput_tbps: 40.0,
        status: 'ENTANGLED_NOMINAL'
      },
      {
        node_id: 'node-oort-sentinel-02',
        name: 'Oort Cloud Sentinel Alpha',
        location: 'Inner Oort Cloud Edge (95 AU)',
        distance_au: 95.0,
        latency_ms: 0.010,
        fidelity_pct: 99.9999,
        throughput_tbps: 48.0,
        status: 'ENTANGLED_NOMINAL'
      },
      {
        node_id: 'node-kuiper-relay-03',
        name: 'Kuiper Belt Relay Array',
        location: 'Pluto-Charon Orbit (39 AU)',
        distance_au: 39.0,
        latency_ms: 0.005,
        fidelity_pct: 99.9998,
        throughput_tbps: 64.0,
        status: 'ENTANGLED_NOMINAL'
      },
      {
        node_id: 'node-jupiter-gateway-04',
        name: 'Jovian Lagrange L2 Relay',
        location: 'Jupiter Orbital System (5.2 AU)',
        distance_au: 5.2,
        latency_ms: 0.001,
        fidelity_pct: 100.0,
        throughput_tbps: 120.0,
        status: 'ENTANGLED_NOMINAL'
      }
    ]);
  }
}
