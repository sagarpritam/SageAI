import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/quantum-foam-fabric/telemetry', {
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
      fabric_id: 'QFWF-WHEELER-PLNK-01',
      planck_length_meters: 1.616255e-35,
      quantum_foam_density_g_cm3: 1.0e94,
      foam_topological_genus_rate_hz: 4.85e43,
      entanglement_bandwidth_qbits_sec: 1.25e45,
      throat_diameter_planck_units: 1.42,
      active_micro_wormhole_nodes: 4,
      last_coherence_sync: new Date().toISOString()
    });
  }
}
