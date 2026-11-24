import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/haps-surveillance/platforms', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback HAPS Surveillance platforms:', error);
  }

  return NextResponse.json([
    {
      platform_id: 'haps-station-alpha-va',
      callsign: 'STRATO-SENTINEL-ALPHA',
      station_corridor: 'Ashburn Hyperscale East Coast Corridor',
      altitude_ft: 65200,
      optical_crosslinks_online: 4,
      solar_battery_charge_pct: 98.4,
      payload_sensors: 'Multi-Spectral EO/IR & 40GHz RF SIGINT Array',
      status: 'STATION_KEEPING_OPTIMAL',
    },
    {
      platform_id: 'haps-station-bravo-eu',
      callsign: 'STRATO-SENTINEL-BRAVO',
      station_corridor: 'Central European Digital Banking Spine',
      altitude_ft: 64800,
      optical_crosslinks_online: 4,
      solar_battery_charge_pct: 96.8,
      payload_sensors: 'Multi-Spectral EO/IR & 40GHz RF SIGINT Array',
      status: 'STATION_KEEPING_OPTIMAL',
    },
    {
      platform_id: 'haps-station-charlie-sg',
      callsign: 'STRATO-SENTINEL-CHARLIE',
      station_corridor: 'Strait of Malacca Sovereign Data Haven',
      altitude_ft: 65500,
      optical_crosslinks_online: 4,
      solar_battery_charge_pct: 99.2,
      payload_sensors: 'Multi-Spectral EO/IR & 40GHz RF SIGINT Array',
      status: 'STATION_KEEPING_OPTIMAL',
    },
    {
      platform_id: 'haps-station-delta-nordic',
      callsign: 'STRATO-SENTINEL-DELTA',
      station_corridor: 'Reykjavik-Oslo Geothermal Datacenter Trench',
      altitude_ft: 63900,
      optical_crosslinks_online: 4,
      solar_battery_charge_pct: 94.5,
      payload_sensors: 'Multi-Spectral EO/IR & 40GHz RF SIGINT Array',
      status: 'STATION_KEEPING_OPTIMAL',
    },
  ]);
}
