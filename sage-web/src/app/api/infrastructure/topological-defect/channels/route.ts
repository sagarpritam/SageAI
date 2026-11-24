import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/topological-defect/channels");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Topological Defect channels:", err);
    return NextResponse.json([
      {
        channel_id: "KIBBLE-ZUREK-QUENCH-ALPHA",
        quench_mode: "Rapid Symmetry-Breaking Soliton Waveguide tau_Q=1.25ns",
        defect_density_per_m2: 4.2e10,
        flux_quanta_h_over_2e: 1.0,
        optical_channel_throughput_pbps: 1250.0,
        status: "QUENCH_SOLITON_ALIGNED",
      },
      {
        channel_id: "FLUXOID-QUANTIZATION-BETA",
        quench_mode: "Superconducting Ring Quantized Magnetic Flux Loop n*Phi_0",
        defect_density_per_m2: 3.8e10,
        flux_quanta_h_over_2e: 1.0,
        optical_channel_throughput_pbps: 1250.0,
        status: "FLUXOID_QUANTIZED",
      },
      {
        channel_id: "VORTEX-WINDING-GAMMA",
        quench_mode: "Topological Winding Number w = +1 Cosmic String Analog",
        defect_density_per_m2: 4.5e10,
        flux_quanta_h_over_2e: 1.0,
        optical_channel_throughput_pbps: 1250.0,
        status: "WINDING_NUMBER_PINNED",
      },
      {
        channel_id: "JOSEPHSON-PERSISTENT-DELTA",
        quench_mode: "Josephson Junction Circulating Supercurrent Persistent Qubit",
        defect_density_per_m2: 4.0e10,
        flux_quanta_h_over_2e: 1.0,
        optical_channel_throughput_pbps: 1250.0,
        status: "PERSISTENT_CURRENT_ACTIVE",
      },
    ]);
  }
}
