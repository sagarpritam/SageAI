import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    active_thruster_count: 3,
    mean_specific_impulse_s: 372000.0,
    mean_exhaust_velocity_km_s: 3648.0,
    trans_solar_intercept_readiness: true,
    penning_trap_antimatter_stored_pg: 1350.0,
    total_pulses_fired: 89,
    capability: "Option B Wave 27 - Sovereign Planetary Antimatter-Catalyzed Fusion Rocket",
  });
}
