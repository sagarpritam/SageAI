import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/drone-defense/perimeters', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Drone Defense perimeters:', error);
  }

  return NextResponse.json([
    {
      perimeter_id: 'perim-ashburn-core',
      campus_name: 'Ashburn VA Hyperscale Secure Campus',
      coverage_radius_km: 5.0,
      turrets_online: 10,
      active_interceptors: 5,
      rf_emitter_power_kw: 25.0,
      threat_level: 'GREEN_NOMINAL',
      status: 'AIRSPACE_LOCKED_SECURE',
    },
    {
      perimeter_id: 'perim-frankfurt-metro',
      campus_name: 'Frankfurt Main Federal Banking Datacenter',
      coverage_radius_km: 4.5,
      turrets_online: 8,
      active_interceptors: 4,
      rf_emitter_power_kw: 20.0,
      threat_level: 'GREEN_NOMINAL',
      status: 'AIRSPACE_LOCKED_SECURE',
    },
    {
      perimeter_id: 'perim-jurong-enclave',
      campus_name: 'Jurong Island Sovereign Enclave Campus',
      coverage_radius_km: 6.0,
      turrets_online: 8,
      active_interceptors: 4,
      rf_emitter_power_kw: 30.0,
      threat_level: 'GREEN_NOMINAL',
      status: 'AIRSPACE_LOCKED_SECURE',
    },
    {
      perimeter_id: 'perim-reykjavik-deep',
      campus_name: 'Reykjavik Geothermal Deep-Rock Facility',
      coverage_radius_km: 4.0,
      turrets_online: 6,
      active_interceptors: 3,
      rf_emitter_power_kw: 15.0,
      threat_level: 'GREEN_NOMINAL',
      status: 'AIRSPACE_LOCKED_SECURE',
    },
  ]);
}
