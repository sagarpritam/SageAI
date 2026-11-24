import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/vacuum-decay-sentinel/detectors', {
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
        detector_id: 'VDS-CORE-01',
        detector_name: 'Planck-Scale Instanton Probe Alpha',
        sector: 'Galactic Core Vacuum Domain',
        higgs_potential_delta_gev: 0.0001,
        bubble_radius_attometer: 0.002,
        status: 'VACUUM_METASTABLE_SECURE'
      },
      {
        detector_id: 'VDS-ORION-02',
        detector_name: 'Orion Cloud Higgs Field Sentry',
        sector: 'Orion Molecular Arm Sector',
        higgs_potential_delta_gev: 0.0002,
        bubble_radius_attometer: 0.001,
        status: 'VACUUM_METASTABLE_SECURE'
      },
      {
        detector_id: 'VDS-PERSEUS-03',
        detector_name: 'Perseus False Vacuum Horizon Guard',
        sector: 'Perseus Sector 8',
        higgs_potential_delta_gev: 0.0004,
        bubble_radius_attometer: 0.003,
        status: 'VACUUM_METASTABLE_SECURE'
      },
      {
        detector_id: 'VDS-VOID-04',
        detector_name: 'Boötes Supervoid Deep Interferometer',
        sector: 'Cosmic Void Sector Omega',
        higgs_potential_delta_gev: 0.0001,
        bubble_radius_attometer: 0.001,
        status: 'VACUUM_METASTABLE_SECURE'
      }
    ]);
  }
}
