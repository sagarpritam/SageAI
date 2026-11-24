import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/atmospheric-lidar/stations', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Atmospheric Lidar stations:', error);
  }

  return NextResponse.json([
    {
      station_id: 'lidar-station-maunakea',
      name: 'Mauna Kea High-Altitude Sodium Guide Star Observatory',
      elevation_m: 4205,
      laser_power_kw: 50.0,
      strehl_ratio: 0.935,
      tracking_target: 'Geostationary Laser Relay Alpha-1',
      turbulence_r0_cm: 22.1,
      status: 'BEAM_COMPENSATION_LOCKED',
    },
    {
      station_id: 'lidar-station-lapalma',
      name: 'Roque de los Muchachos Aerosol Sounding Array',
      elevation_m: 2396,
      laser_power_kw: 45.0,
      strehl_ratio: 0.918,
      tracking_target: 'HAPS Stratospheric Loiter Node 04',
      turbulence_r0_cm: 19.4,
      status: 'BEAM_COMPENSATION_LOCKED',
    },
    {
      station_id: 'lidar-station-paranal',
      name: 'Cerro Paranal Adaptive Optics Laser Unit',
      elevation_m: 2635,
      laser_power_kw: 48.0,
      strehl_ratio: 0.942,
      tracking_target: 'LEO Quantum Cryptographic Uplink Sat-7',
      turbulence_r0_cm: 24.0,
      status: 'BEAM_COMPENSATION_LOCKED',
    },
    {
      station_id: 'lidar-station-haleakala',
      name: 'Haleakala Space Surveillance Laser Compensator',
      elevation_m: 3055,
      laser_power_kw: 40.0,
      strehl_ratio: 0.905,
      tracking_target: 'Deep-Space Optical Transceiver Cluster',
      turbulence_r0_cm: 18.2,
      status: 'BEAM_COMPENSATION_LOCKED',
    },
  ]);
}
