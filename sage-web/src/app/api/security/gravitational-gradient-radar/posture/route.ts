import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/gravitational-gradient-radar/posture', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Gravitational Gradient Radar posture:', error);
  }

  return NextResponse.json({
    system_id: 'deep-space-grav-interferometer-01',
    status: 'GRAVITATIONAL_INTERFEROMETRIC_SURVEILLANCE_ACTIVE',
    interferometer_arm_length_km: 100000.0,
    strain_sensitivity_h_per_sqrt_hz: 1.2e-21,
    laser_wavelength_nm: 1064.0,
    mass_gradient_resolution_eotvos: 0.0014,
    tracked_stealth_mass_vectors: 64,
    active_interferometer_constellations: 3,
    inertial_navigation_drift_arcsec_yr: 0.0004,
    last_gradient_sweep_timestamp: new Date().toISOString(),
  });
}
