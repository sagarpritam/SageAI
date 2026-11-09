import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "RG-NODE-REUTER-CERN-01",
      facility_name: "CERN Large Hadron Trans-Planckian FRG Regulator Cavity",
      cutoff_scale_k_gev: 1.22e19,
      dimensionless_newton_g: 0.704,
      dimensionless_cosmo_lambda: 0.191,
      uv_fixed_point_attractor_g_star: 0.707,
      uv_fixed_point_attractor_lambda_star: 0.193,
      wetterich_morris_flow_rate: 0.084,
      status: "RG_FLOW_ATTRACTOR_ACTIVE",
    },
    {
      node_id: "RG-NODE-DESY-02",
      facility_name: "DESY Relativistic Quantum Metric Flow Stabilizer",
      cutoff_scale_k_gev: 9.85e18,
      dimensionless_newton_g: 0.698,
      dimensionless_cosmo_lambda: 0.188,
      uv_fixed_point_attractor_g_star: 0.707,
      uv_fixed_point_attractor_lambda_star: 0.193,
      wetterich_morris_flow_rate: 0.076,
      status: "RG_FLOW_ATTRACTOR_ACTIVE",
    },
    {
      node_id: "RG-NODE-ORBITAL-L2-03",
      facility_name: "Lagrange L2 Deep-Space Asymptotic Curvature Regulator",
      cutoff_scale_k_gev: 1.45e19,
      dimensionless_newton_g: 0.709,
      dimensionless_cosmo_lambda: 0.194,
      uv_fixed_point_attractor_g_star: 0.707,
      uv_fixed_point_attractor_lambda_star: 0.193,
      wetterich_morris_flow_rate: 0.092,
      status: "RG_FLOW_ATTRACTOR_ACTIVE",
    },
  ]);
}

