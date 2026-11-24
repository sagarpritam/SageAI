import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/gravitational-gradient-radar/apertures', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Gravitational Gradient Radar apertures:', error);
  }

  return NextResponse.json([
    {
      aperture_id: 'grav-sat-lagrange-l1',
      name: 'Deep-Space Interferometer Core L1-Alpha',
      position: 'Sun-Earth L1 Halo',
      baseline_km: 100000.0,
      laser_power_w: 12.0,
      strain_floor: 1.2e-21,
      status: 'PHASE_LOCKED',
    },
    {
      aperture_id: 'grav-sat-lagrange-l2',
      name: 'Gravitational Sentry Node L2-Beta',
      position: 'Sun-Earth L2 Halo',
      baseline_km: 100000.0,
      laser_power_w: 12.0,
      strain_floor: 1.1e-21,
      status: 'PHASE_LOCKED',
    },
    {
      aperture_id: 'grav-sat-lunar-gateway-l3',
      name: 'Cislunar Grav-Gradient Anchor L3-Gamma',
      position: 'Earth-Moon L4 Stable Point',
      baseline_km: 85000.0,
      laser_power_w: 10.0,
      strain_floor: 1.4e-21,
      status: 'PHASE_LOCKED',
    },
    {
      aperture_id: 'grav-sat-heliocentric-delta',
      name: 'Heliocentric Trailing Aperture Delta',
      position: 'Earth-Trailing 0.05 AU',
      baseline_km: 120000.0,
      laser_power_w: 15.0,
      strain_floor: 0.95e-21,
      status: 'PHASE_LOCKED',
    },
  ]);
}
