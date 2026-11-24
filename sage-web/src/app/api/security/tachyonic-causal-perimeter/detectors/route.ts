import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/tachyonic-causal-perimeter/detectors', {
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
        array_id: 'TCP-SGR-01',
        array_name: 'Ergosphere Causal Horizon Sentry',
        sector: 'Galactic Core Sector 0',
        sterile_neutrino_flux_gev: 4200000.0,
        causal_drift_femtosec: 0.002,
        status: 'SECURE_NOMINAL'
      },
      {
        array_id: 'TCP-CYG-02',
        array_name: 'Cygnus Rift Phase Interceptor',
        sector: 'Cygnus Arm Sector 3',
        sterile_neutrino_flux_gev: 3100000.0,
        causal_drift_femtosec: 0.005,
        status: 'SECURE_NOMINAL'
      },
      {
        array_id: 'TCP-ORI-03',
        array_name: 'Local Bubble Chrono-Stabilizer',
        sector: 'Orion Spur Sector 7',
        sterile_neutrino_flux_gev: 2800000.0,
        causal_drift_femtosec: 0.001,
        status: 'SECURE_NOMINAL'
      },
      {
        array_id: 'TCP-PER-04',
        array_name: 'Perseus Outer Causal Bastion',
        sector: 'Perseus Sector 12',
        sterile_neutrino_flux_gev: 2400000.0,
        causal_drift_femtosec: 0.008,
        status: 'SECURE_NOMINAL'
      }
    ]);
  }
}
