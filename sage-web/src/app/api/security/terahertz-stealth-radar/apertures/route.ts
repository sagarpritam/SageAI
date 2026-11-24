import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/terahertz-stealth-radar/apertures', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Terahertz Stealth Radar apertures:', error);
  }

  return NextResponse.json([
    {
      aperture_id: 'thz-aperture-thule',
      name: 'Thule Arctic Quantum Radar Site 01',
      elevation_m: 760,
      frequency_thz: 3.8,
      resolution_mm: 0.38,
      stealth_targets_tracked: 8,
      quantum_snr_db: 42.6,
      status: 'ACTIVE_TRACKING_LOCKED',
    },
    {
      aperture_id: 'thz-aperture-guam',
      name: 'Guam Western Pacific Metamaterial Array 02',
      elevation_m: 120,
      frequency_thz: 4.2,
      resolution_mm: 0.44,
      stealth_targets_tracked: 11,
      quantum_snr_db: 44.1,
      status: 'ACTIVE_TRACKING_LOCKED',
    },
    {
      aperture_id: 'thz-aperture-diegogarcia',
      name: 'Diego Garcia Indian Ocean Counter-Stealth Node 03',
      elevation_m: 15,
      frequency_thz: 2.9,
      resolution_mm: 0.51,
      stealth_targets_tracked: 5,
      quantum_snr_db: 40.8,
      status: 'ACTIVE_TRACKING_LOCKED',
    },
    {
      aperture_id: 'thz-aperture-mtwashington',
      name: 'Mount Washington High-Frequency THz Mast 04',
      elevation_m: 1917,
      frequency_thz: 5.1,
      resolution_mm: 0.35,
      stealth_targets_tracked: 4,
      quantum_snr_db: 45.3,
      status: 'ACTIVE_TRACKING_LOCKED',
    },
  ]);
}
