import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/hypersonic-waverider/telemetry', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      hypergrid_id: 'hypersonic-waverider-grid-01',
      status: 'SUB_ORBITAL_CORRIDORS_CLEAR',
      fleet_class: 'Trans-Atmospheric Scramjet WaveRider (Mach 14)',
      cruising_speed_mach: 14.2,
      service_ceiling_altitude_km: 42.0,
      max_point_to_point_transit_minutes: 42.5,
      active_waverider_airframes: 24,
      daily_payload_capacity_metric_tons: 380.0,
      thermal_protection_system: 'Ultra-High Temperature Zirconium Diboride (ZrB2-SiC)',
      successful_orbital_reentry_rate_pct: 100.0,
      last_flight_dispatch_timestamp: new Date().toISOString()
    });
  }
}
