import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/ctc-firewall/horizons', {
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
        horizon_id: 'CTC-HORIZON-TIPLER',
        horizon_name: 'Tipler Cylinder Relativistic Ergoregion',
        sector: 'Sagittarius A* Orbital Domain',
        metric_strain_h: 1.2e-21,
        quantum_backreaction_gev: 4.5e28,
        status: 'CHRONOLOGY_PROTECTION_ENFORCED'
      },
      {
        horizon_id: 'CTC-HORIZON-KERR',
        horizon_name: 'Kerr Ring Singularity Outer Boundary',
        sector: 'Inner Ergosphere Core 0',
        metric_strain_h: 8.9e-22,
        quantum_backreaction_gev: 6.2e28,
        status: 'CHRONOLOGY_PROTECTION_ENFORCED'
      },
      {
        horizon_id: 'CTC-HORIZON-STRING',
        horizon_name: 'Gott Relativistic Dual-String Intersection',
        sector: 'Deep Halo Cosmic Filament',
        metric_strain_h: 1.5e-21,
        quantum_backreaction_gev: 3.8e28,
        status: 'CHRONOLOGY_PROTECTION_ENFORCED'
      },
      {
        horizon_id: 'CTC-HORIZON-WORMHOLE',
        horizon_name: 'Cauchy Instability Gate Perimeter',
        sector: 'Traversable Bridge Nexus Beta',
        metric_strain_h: 6.4e-22,
        quantum_backreaction_gev: 2.9e28,
        status: 'CHRONOLOGY_PROTECTION_ENFORCED'
      }
    ]);
  }
}
