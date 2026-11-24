import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/neutrino-flux-tomography/posture', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Neutrino Flux Tomography posture:', error);
  }

  return NextResponse.json({
    network_id: 'geoneutrino-tomography-array-01',
    status: 'NEUTRINO_MANTLE_INVERSION_ACTIVE',
    detector_medium: 'Ultra-Pure Linear Alkylbenzene Scintillator',
    total_target_mass_kilotons: 150.0,
    energy_threshold_mev: 1.8,
    spatial_resolution_km: 12.5,
    active_deep_cavern_observatories: 8,
    detected_geoneutrino_events_per_day: 420.0,
    subterranean_density_anomalies_mapped: 34,
    last_tomography_inversion_timestamp: new Date().toISOString(),
  });
}
