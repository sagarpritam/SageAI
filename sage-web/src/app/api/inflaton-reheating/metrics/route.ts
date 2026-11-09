import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_reheating_nodes: 3,
    completed_reheating_cycles: 24,
    mean_baryon_asymmetry_eta_b: 6.18e-10,
    standard_model_dof_g_star: 106.75,
    entropy_pump_status: "SUPERCRITICAL_PLASMA_EQUILIBRIUM",
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
  });
}
