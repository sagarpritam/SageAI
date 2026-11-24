import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/galactic-qkd/constellations', {
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
        constellation_id: 'const-sol-centauri-arc',
        name: 'Sol-Alpha Centauri Local Interstellar Arc',
        sector: 'Sector 001 (Solar Neighborhood)',
        span_lightyears: 4.37,
        repeater_nodes: 128,
        qber_pct: 0.0001,
        status: 'ENTANGLEMENT_SEALED'
      },
      {
        constellation_id: 'const-orion-deep-arm',
        name: 'Orion-Cygnus Mid-Arm Backbone Cluster',
        sector: 'Sector 014 (Orion Molecular Cloud Gateway)',
        span_lightyears: 1344.0,
        repeater_nodes: 512,
        qber_pct: 0.00015,
        status: 'ENTANGLEMENT_SEALED'
      },
      {
        constellation_id: 'const-perseus-bridge',
        name: 'Perseus Arm Transit Relay Constellation',
        sector: 'Sector 028 (Perseus Gap Relay)',
        span_lightyears: 6400.0,
        repeater_nodes: 1024,
        qber_pct: 0.00018,
        status: 'ENTANGLEMENT_SEALED'
      },
      {
        constellation_id: 'const-cygnus-x-sentinel',
        name: 'Cygnus-X Extreme High-Flux Bastion',
        sector: 'Sector 064 (Cygnus Starburst Boundary)',
        span_lightyears: 9800.0,
        repeater_nodes: 2048,
        qber_pct: 0.00022,
        status: 'ENTANGLEMENT_SEALED'
      }
    ]);
  }
}
