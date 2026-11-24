import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/micro-hydro-pumped-storage/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Micro Hydro Pumped Storage telemetry:', error);
  }

  return NextResponse.json({
    grid_system_id: 'subterranean-phes-hypergrid-01',
    status: 'CLOSED_LOOP_PHES_DISPATCH_ACTIVE',
    total_installed_capacity_mw: 1200.0,
    stored_energy_gwh: 9.6,
    hydraulic_head_meters: 1200.0,
    round_trip_efficiency_pct: 84.5,
    response_time_milliseconds: 45.0,
    active_subterranean_caverns: 12,
    datacenter_transient_buffer_pct: 99.99,
    datacenter_pue: 1.005,
    last_pumping_cycle_timestamp: new Date().toISOString(),
  });
}
