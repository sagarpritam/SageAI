import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/vacuum-birefringence-cloak/nodes', {
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
        node_id: 'VBCL-NODE-PRIME',
        node_name: 'Galactic Command QED Birefringence Array',
        magnetic_field_tesla: 2.45e9,
        optical_depth_warping: 4.8e-8,
        attenuation_db: -104.2,
        status: 'VACUUM_POLARIZATION_LOCKED'
      },
      {
        node_id: 'VBCL-NODE-DEFENSE',
        node_name: 'Perimeter Schwinger Polarizer Node',
        magnetic_field_tesla: 2.15e9,
        optical_depth_warping: 4.2e-8,
        attenuation_db: -99.5,
        status: 'VACUUM_POLARIZATION_LOCKED'
      },
      {
        node_id: 'VBCL-NODE-NEXUS',
        node_name: 'Tachyonic Refractive Warp Emitter',
        magnetic_field_tesla: 1.95e9,
        optical_depth_warping: 3.8e-8,
        attenuation_db: -96.8,
        status: 'VACUUM_POLARIZATION_LOCKED'
      },
      {
        node_id: 'VBCL-NODE-HORIZON',
        node_name: 'Event Horizon Shadow Mask Sentry',
        magnetic_field_tesla: 1.65e9,
        optical_depth_warping: 3.1e-8,
        attenuation_db: -93.5,
        status: 'CALIBRATION_SYNCHRONIZED'
      }
    ]);
  }
}
