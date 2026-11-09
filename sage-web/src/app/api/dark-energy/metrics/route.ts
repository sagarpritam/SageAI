import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_quintessence_harvesters: 3,
    total_harvest_rate_mw: 1650.0,
    mean_equation_of_state_w: -1.023,
    stabilization_events_logged: 12,
    cosmic_inflation_mode: "QUINTESSENCE_NEGATIVE_PRESSURE_COUPLED",
    status: "OPERATIONAL",
  });
}
