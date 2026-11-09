import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_space_mesh_nodes: 4,
    max_quantum_reach_km: 225000000.0,
    mean_qber_pct: 2.29,
    completed_entanglement_swaps: 28,
    protocol: "DECOY_STATE_BB84_CONTINUOUS_VARIABLE_CVQKD",
    status: "OPERATIONAL",
  });
}

