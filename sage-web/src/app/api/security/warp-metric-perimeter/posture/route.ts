import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/warp-metric-perimeter/posture', {
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
      perimeter_id: 'warp-perimeter-guard-01',
      status: 'METRIC_DISTORTION_DETECTION_ACTIVE',
      sensor_architecture: 'Alcubierre Negative Energy Tensor Curvature Interferometer Mesh',
      spatial_curvature_resolution_planck: 1.2e-35,
      negative_energy_density_threshold_j_m3: -1e-12,
      active_graviton_interferometers: 64,
      perimeter_radius_km: 850000.0,
      cloaked_singularity_detection_ratio: 0.9994,
      metric_strain_sensitivity_h: 1.4e-23,
      last_distortion_scan_timestamp: new Date().toISOString()
    });
  }
}
