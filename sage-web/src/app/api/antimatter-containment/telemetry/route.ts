import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cellId = url.searchParams.get("cell_id") || "CELL-ALPHA-PENNING-01";

  return NextResponse.json({
    telemetry_id: `AP-TEL-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    cell_id: cellId,
    stored_antiprotons: 850000000,
    plasma_density_cm3: 1980000.0,
    magnetic_drift_velocity_m_s: 18.9,
    annihilation_loss_rate_per_sec: 0.058,
    quench_dump_readiness_pct: 99.98,
    stability_margin_sigma: 6.1,
    status: "NOMINAL_CONFINED",
    timestamp: new Date().toISOString(),
  });
}

