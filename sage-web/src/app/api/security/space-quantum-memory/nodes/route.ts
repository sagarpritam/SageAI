import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/space-quantum-memory/nodes', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Space Quantum Memory nodes:', error);
  }

  return NextResponse.json([
    {
      node_id: 'sqm-node-leo-alpha',
      name: 'Orbital Quantum Repeater Node Alpha (LEO 650km)',
      altitude_km: 650,
      memory_cells: 4,
      coherence_ms: 1250.0,
      fidelity_pct: 98.9,
      buffered_pairs_m: 850.0,
      status: 'CRYOGENIC_LOCKED',
    },
    {
      node_id: 'sqm-node-meo-beta',
      name: 'Orbital Quantum Repeater Node Beta (MEO 2000km)',
      altitude_km: 2000,
      memory_cells: 4,
      coherence_ms: 1220.0,
      fidelity_pct: 98.5,
      buffered_pairs_m: 780.0,
      status: 'CRYOGENIC_LOCKED',
    },
    {
      node_id: 'sqm-node-polar-gamma',
      name: 'Polar Photonic Entanglement Buffer Node Gamma',
      altitude_km: 800,
      memory_cells: 4,
      coherence_ms: 1260.0,
      fidelity_pct: 99.1,
      buffered_pairs_m: 920.0,
      status: 'CRYOGENIC_LOCKED',
    },
    {
      node_id: 'sqm-node-geo-sync-delta',
      name: 'Geosynchronous Optical Memory Gateway Delta',
      altitude_km: 35786,
      memory_cells: 4,
      coherence_ms: 1190.0,
      fidelity_pct: 98.2,
      buffered_pairs_m: 640.0,
      status: 'CRYOGENIC_LOCKED',
    },
  ]);
}
