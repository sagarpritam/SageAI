import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/satellite-uplink/constellations', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback satellite constellations:', error);
  }

  // Fallback high-fidelity constellations array
  return NextResponse.json([
    {
      constellation_id: 'starlink-direct-gen2',
      operator: 'SpaceX Starlink LEO',
      altitude_km: 550,
      laser_crosslinks_active: 48,
      downlink_speed_gbps: 18.5,
      rtt_latency_ms: 16.4,
      signal_quality_pct: 99.8,
      status: 'PRIMARY_UPLINK_ACTIVE',
    },
    {
      constellation_id: 'project-kuiper-polar',
      operator: 'Amazon Kuiper LEO',
      altitude_km: 630,
      laser_crosslinks_active: 42,
      downlink_speed_gbps: 12.0,
      rtt_latency_ms: 19.8,
      signal_quality_pct: 98.9,
      status: 'HOT_STANDBY',
    },
    {
      constellation_id: 'oneweb-enterprise-mesh',
      operator: 'Eutelsat OneWeb LEO',
      altitude_km: 1200,
      laser_crosslinks_active: 38,
      downlink_speed_gbps: 9.5,
      rtt_latency_ms: 24.2,
      signal_quality_pct: 97.4,
      status: 'REDUNDANT_BACKUP',
    },
  ]);
}
