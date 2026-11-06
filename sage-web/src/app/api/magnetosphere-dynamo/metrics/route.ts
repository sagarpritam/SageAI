import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_dynamo_stations: 3,
    total_decoupling_events: 19,
    mean_attenuation_db: 49.5,
    resonance_mode: "ALFVEN_ULF_MAGNETOHYDRODYNAMIC",
    hemp_e1_response_limit_ps: 400.0,
    status: "OPERATIONAL",
  });
}
