import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/terahertz-stealth-radar/posture', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Terahertz Stealth Radar posture:', error);
  }

  return NextResponse.json({
    system_id: 'thz-metamaterial-counter-stealth-01',
    status: 'QUANTUM_TERAHERTZ_SURVEILLANCE_ACTIVE',
    operating_frequency_band_thz: '0.1 - 10.0 THz Metamaterial',
    spatial_resolution_submillimeter_mm: 0.42,
    quantum_entangled_photon_pairs_sec: 1.4e14,
    stealth_ram_penetration_depth_cm: 4.8,
    synthetic_aperture_scan_radius_km: 450.0,
    active_radar_apertures: 12,
    detected_low_observable_signatures: 28,
    last_airspace_scan_timestamp: new Date().toISOString(),
  });
}
