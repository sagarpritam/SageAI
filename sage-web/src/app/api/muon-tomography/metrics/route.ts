import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_telescope_stations: 3,
    completed_scans_count: 14,
    total_effective_area_m2: 13.3,
    zenith_tracking_mode: "CONTINUOUS_COSMIC_ATTENUATION",
    max_penetration_depth_m: 1200.0,
    status: "OPERATIONAL",
  });
}
