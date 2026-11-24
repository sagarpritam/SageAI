import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stratospheric-aerosol-albedo/fleets', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Stratospheric Aerosol Albedo fleets:', error);
  }

  return NextResponse.json([
    {
      fleet_id: 'aerosol-fleet-equatorial-01',
      name: 'Equatorial Stratospheric Solar UAS Wing 01',
      patrol_sector: 'ITCZ Pacific High Albedo Sector',
      altitude_km: 22.5,
      drone_count: 24,
      calcite_payload_tons: 360.0,
      optical_depth_tau: 0.085,
      status: 'DISPERSAL_ACTIVE',
    },
    {
      fleet_id: 'aerosol-fleet-subtropical-02',
      name: 'Subtropical High Pressure Solar Fleet 02',
      patrol_sector: 'Sahara-Atlantic Transition Corridor',
      altitude_km: 22.0,
      drone_count: 20,
      calcite_payload_tons: 300.0,
      optical_depth_tau: 0.082,
      status: 'DISPERSAL_ACTIVE',
    },
    {
      fleet_id: 'aerosol-fleet-monsoon-03',
      name: 'Indian Ocean Monsoon Radiative Buffer 03',
      patrol_sector: 'Bay of Bengal Stratospheric Arc',
      altitude_km: 21.8,
      drone_count: 18,
      calcite_payload_tons: 270.0,
      optical_depth_tau: 0.079,
      status: 'DISPERSAL_ACTIVE',
    },
    {
      fleet_id: 'aerosol-fleet-antarctic-04',
      name: 'Southern Circumpolar Polar Vortex Shield 04',
      patrol_sector: 'Antarctic Convergence Latitude 60S',
      altitude_km: 21.5,
      drone_count: 16,
      calcite_payload_tons: 240.0,
      optical_depth_tau: 0.088,
      status: 'DISPERSAL_ACTIVE',
    },
  ]);
}
