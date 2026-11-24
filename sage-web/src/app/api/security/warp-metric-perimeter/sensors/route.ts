import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/warp-metric-perimeter/sensors', {
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
        sensor_id: 'sensor-lagrange-l1-01',
        name: 'L1 Sol-Earth Graviton Interferometer',
        location: 'Lagrange L1 Point (1.5M km Sunward)',
        baseline_length_km: 150000.0,
        strain_sensitivity_h: 1.4e-23,
        curvature_tensor_ricci: 0.0000042,
        status: 'TENSOR_LOCKED'
      },
      {
        sensor_id: 'sensor-lagrange-l2-02',
        name: 'L2 Deep Shadow Metric Sentinel',
        location: 'Lagrange L2 Point (1.5M km Anti-Sunward)',
        baseline_length_km: 180000.0,
        strain_sensitivity_h: 1.2e-23,
        curvature_tensor_ricci: 0.0000038,
        status: 'TENSOR_LOCKED'
      },
      {
        sensor_id: 'sensor-lunar-orbit-03',
        name: 'Selenocentric Polar Sagnac Array',
        location: 'Lunar Polar Orbit (384,000 km)',
        baseline_length_km: 85000.0,
        strain_sensitivity_h: 1.5e-23,
        curvature_tensor_ricci: 0.0000051,
        status: 'TENSOR_LOCKED'
      },
      {
        sensor_id: 'sensor-geo-equatorial-04',
        name: 'Geostationary Ring Quadrant Delta',
        location: 'GEO Slot 120°E (35,786 km)',
        baseline_length_km: 42000.0,
        strain_sensitivity_h: 1.6e-23,
        curvature_tensor_ricci: 0.0000049,
        status: 'TENSOR_LOCKED'
      }
    ]);
  }
}
