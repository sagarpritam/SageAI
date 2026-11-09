import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_desitter_nodes: 3,
    aggregate_repulsion_force_nn: 179.5,
    mean_screening_efficiency_pct: 99.65,
    completed_repulsion_events: 14,
    cosmological_constant_lambda_m2: 1.1056e-52,
    status: "OPERATIONAL",
  });
}
