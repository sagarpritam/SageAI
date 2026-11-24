import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/subsea-sonar/cables', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Subsea Sonar cables:', error);
  }

  return NextResponse.json([
    {
      cable_id: 'cable-tat-14-north',
      corridor_name: 'Transatlantic Subsea Optical Trunk Alpha (TAT-14/N)',
      length_km: 12400.0,
      hydrophones_online: 320,
      quantum_mag_online: 80,
      acoustic_noise_floor_db: 34.2,
      tamper_detection_state: 'GREEN_NOMINAL',
      status: 'ACOUSTIC_SHIELD_LOCKED',
    },
    {
      cable_id: 'cable-pacific-light-express',
      corridor_name: 'Transpacific Ultra-Low-Latency Quantum Trunk (PLX-1)',
      length_km: 14800.0,
      hydrophones_online: 410,
      quantum_mag_online: 110,
      acoustic_noise_floor_db: 31.8,
      tamper_detection_state: 'GREEN_NOMINAL',
      status: 'ACOUSTIC_SHIELD_LOCKED',
    },
    {
      cable_id: 'cable-sea-me-we-6',
      corridor_name: 'Mediterranean-Suez-Indo HyperCore Fiber (SMW-6)',
      length_km: 9600.0,
      hydrophones_online: 310,
      quantum_mag_online: 75,
      acoustic_noise_floor_db: 38.5,
      tamper_detection_state: 'GREEN_NOMINAL',
      status: 'ACOUSTIC_SHIELD_LOCKED',
    },
    {
      cable_id: 'cable-arctic-ice-link',
      corridor_name: 'Svalbard-Nordic Abyssal Trench Fiber Link (ARC-ICE)',
      length_km: 5700.0,
      hydrophones_online: 240,
      quantum_mag_online: 55,
      acoustic_noise_floor_db: 28.6,
      tamper_detection_state: 'GREEN_NOMINAL',
      status: 'ACOUSTIC_SHIELD_LOCKED',
    },
  ]);
}
