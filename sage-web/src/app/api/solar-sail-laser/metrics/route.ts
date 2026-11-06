import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_laser_arrays: 3,
    total_phased_power_gw: 305.0,
    mean_strehl_ratio: 0.93,
    total_propulsion_events: 16,
    primary_array_mode: "COHERENT_INTERFEROMETRIC_PHASE_LOCK",
    status: "OPERATIONAL",
  });
}
