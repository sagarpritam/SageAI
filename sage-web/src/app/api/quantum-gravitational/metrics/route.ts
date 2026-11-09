import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_gravitational_nodes: 3,
    completed_observations: 14,
    mean_trap_temp_nk: 42.3,
    interferometer_physics: "BOSE_EINSTEIN_CONDENSATE_BRAGG_DIFFRACTION",
    sensitivity_scale: "PLANCK_METRIC_RESOLVED",
    status: "OPERATIONAL",
  });
}

