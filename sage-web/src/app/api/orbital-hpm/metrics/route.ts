import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_orbital_hpm_satellites: 3,
    peak_constellation_power_gw: 9.1,
    total_pulse_discharges: 29,
    mean_target_kill_pct: 99.4,
    constellation_readiness_pct: 100.0,
    status: "ORBITAL_HPM_DIRECTED_ENERGY_ARMED",
    timestamp: new Date().toISOString(),
  });
}

