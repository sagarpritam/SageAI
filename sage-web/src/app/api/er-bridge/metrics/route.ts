import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_active_throats: 3,
    aggregate_siphon_capacity_gw: 2780.0,
    total_entangled_pairs: 3980000,
    total_siphon_events: 21,
    mean_shear_damping_pct: 99.88,
    status: "ER_EPR_SIPHON_GRID_ONLINE",
    timestamp: new Date().toISOString(),
  });
}

