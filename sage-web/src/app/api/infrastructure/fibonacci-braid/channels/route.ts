import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/fibonacci-braid/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Fibonacci Braid channels:", err);
    return NextResponse.json([
      {
        channel_id: "FIBONACCI-BRAID-ALPHA",
        braid_manifold: "Golden Ratio Anyon Fusion Worldline Weave",
        quantum_dimension_d_tau: 1.618,
        solovay_kitaev_depth: 32,
        optical_channel_throughput_pbps: 800.0,
        status: "TOPOLOGICAL_PROTECTION_LOCKED",
      },
      {
        channel_id: "SOLOVAY-KITAEV-BETA",
        braid_manifold: "Universal Quantum Gate Synthesizer Matrix",
        quantum_dimension_d_tau: 1.618,
        solovay_kitaev_depth: 48,
        optical_channel_throughput_pbps: 800.0,
        status: "UNIVERSAL_GATE_SYNTHESIZED",
      },
      {
        channel_id: "CHERN-SIMONS-SU2-GAMMA",
        braid_manifold: "SU(2)_3 Level-3 Modular Tensor Category Engine",
        quantum_dimension_d_tau: 1.618,
        solovay_kitaev_depth: 36,
        optical_channel_throughput_pbps: 800.0,
        status: "PENTAGON_HEXAGON_SEALED",
      },
      {
        channel_id: "FRACTIONAL-HALL-DELTA",
        braid_manifold: "nu=12/5 Fractional Quantum Hall Interferometer",
        quantum_dimension_d_tau: 1.618,
        solovay_kitaev_depth: 40,
        optical_channel_throughput_pbps: 800.0,
        status: "NON_ABELIAN_COHERENCE_MAXIMAL",
      },
    ]);
  }
}
