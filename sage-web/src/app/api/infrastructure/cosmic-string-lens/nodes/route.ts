import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/cosmic-string-lens/nodes', {
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
        node_id: 'CSLG-NODE-ALPHA',
        node_name: 'Great Attractor Relativistic String Node',
        conical_deficit_arcsec: 2.18,
        magnification_power: 480.0,
        angular_resolution_microarcsec: 0.015,
        status: 'LENSING_COHERENT_ALIGNED'
      },
      {
        node_id: 'CSLG-NODE-BETA',
        node_name: 'Perseus Cuspidal Loop Array',
        conical_deficit_arcsec: 2.12,
        magnification_power: 440.0,
        angular_resolution_microarcsec: 0.018,
        status: 'LENSING_COHERENT_ALIGNED'
      },
      {
        node_id: 'CSLG-NODE-GAMMA',
        node_name: 'Shapley Deep Shear Interferometer',
        conical_deficit_arcsec: 2.25,
        magnification_power: 510.0,
        angular_resolution_microarcsec: 0.012,
        status: 'LENSING_COHERENT_ALIGNED'
      },
      {
        node_id: 'CSLG-NODE-DELTA',
        node_name: 'Local Void Deflection Sentry',
        conical_deficit_arcsec: 2.05,
        magnification_power: 390.0,
        angular_resolution_microarcsec: 0.022,
        status: 'CALIBRATION_SYNCHRONIZED'
      }
    ]);
  }
}
