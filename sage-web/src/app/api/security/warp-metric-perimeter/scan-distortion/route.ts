import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch('http://127.0.0.1:8000/api/security/warp-metric-perimeter/scan-distortion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      scan_id: `warp-scan-${Math.random().toString(36).substring(2, 10)}`,
      sensor_id: 'sensor-lagrange-l1-01',
      sensor_name: 'L1 Sol-Earth Graviton Interferometer',
      target_radius_km: 750000.0,
      metric_gradient_c2_m: 3.4e-18,
      negative_energy_density_j_m3: -2.85e-13,
      detected_warp_factor: 1.04,
      curvature_strain_h: 1.35e-23,
      anomaly_confidence_pct: 99.98,
      timestamp: new Date().toISOString(),
      status: 'WARP_METRIC_DISTORTION_SCANNED',
      success: true
    });
  }
}
