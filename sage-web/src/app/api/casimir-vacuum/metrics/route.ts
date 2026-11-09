import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_casimir_resonators: 3,
    mean_squeezing_factor_db: 15.1,
    total_harvest_discharges: 18,
    lowest_cryo_temp_mk: 8.5,
    physics_mode: "PARAMETRIC_SQUID_RELATIVISTIC_DYNAMIC_CASIMIR",
    status: "OPERATIONAL",
  });
}
