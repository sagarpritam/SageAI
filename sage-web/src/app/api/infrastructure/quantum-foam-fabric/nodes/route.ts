import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/quantum-foam-fabric/nodes', {
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
        node_id: 'QFWF-NODE-ALPHA',
        node_name: 'Wheeler Planck Fluctuation Gate Alpha',
        topological_genus: 840,
        throat_stability_pct: 99.998,
        flux_throughput_yotta_qbits: 580.0,
        status: 'FOAM_TOPOLOGY_COHERENT'
      },
      {
        node_id: 'QFWF-NODE-BETA',
        node_name: 'Spacetime Foam Lattice Resonator Beta',
        topological_genus: 790,
        throat_stability_pct: 99.995,
        flux_throughput_yotta_qbits: 490.0,
        status: 'FOAM_TOPOLOGY_COHERENT'
      },
      {
        node_id: 'QFWF-NODE-GAMMA',
        node_name: 'Sub-Planckian Entanglement Bridge Gamma',
        topological_genus: 920,
        throat_stability_pct: 99.999,
        flux_throughput_yotta_qbits: 620.0,
        status: 'FOAM_TOPOLOGY_COHERENT'
      },
      {
        node_id: 'QFWF-NODE-DELTA',
        node_name: 'Micro-Cauchy Throat Anchor Delta',
        topological_genus: 710,
        throat_stability_pct: 99.992,
        flux_throughput_yotta_qbits: 430.0,
        status: 'CALIBRATION_SYNCHRONIZED'
      }
    ]);
  }
}
