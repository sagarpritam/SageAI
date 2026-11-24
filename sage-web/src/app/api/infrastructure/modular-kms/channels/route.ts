import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/modular-kms/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Modular KMS channels:", err);
    return NextResponse.json([
      {
        channel_id: "TOMITA-MODULAR-ALPHA",
        automorphism_manifold: "Tomita-Takesaki Modular Automorphism Group Flow sigma_t",
        inverse_temperature_beta: 1.0,
        modular_flow_depth_t: 14.5,
        optical_channel_throughput_pbps: 1000.0,
        status: "MODULAR_FLOW_LOCKED",
      },
      {
        channel_id: "KMS-THERMAL-EQUILIBRIUM-BETA",
        automorphism_manifold: "Kubo-Martin-Schwinger Analytic Boundary State",
        inverse_temperature_beta: 1.0,
        modular_flow_depth_t: 18.2,
        optical_channel_throughput_pbps: 1000.0,
        status: "KMS_BOUNDARY_MATCHED",
      },
      {
        channel_id: "VON-NEUMANN-TYPE-III-GAMMA",
        automorphism_manifold: "Type III_1 Hyperfinite Factor Substrate",
        inverse_temperature_beta: 1.0,
        modular_flow_depth_t: 22.0,
        optical_channel_throughput_pbps: 1000.0,
        status: "HYPERFINITE_STATE_CONVERGED",
      },
      {
        channel_id: "MODULAR-HAMILTONIAN-DELTA",
        automorphism_manifold: "Relative Entropy Modular Hamiltonian Flow K = -ln(Delta)",
        inverse_temperature_beta: 1.0,
        modular_flow_depth_t: 16.8,
        optical_channel_throughput_pbps: 1000.0,
        status: "ENTROPY_FLOW_MAXIMAL",
      },
    ]);
  }
}
