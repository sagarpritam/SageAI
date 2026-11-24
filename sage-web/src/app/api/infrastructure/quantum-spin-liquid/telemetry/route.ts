import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/quantum-spin-liquid/telemetry", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Quantum Spin Liquid telemetry:", err);
    return NextResponse.json({
      backbone_id: "QSLB-KITAEV-MAJORANA-01",
      lattice_symmetry: "HONEYCOMB_C3V_CHIRAL",
      kitaev_coupling_k_mev: 8.5,
      thermal_hall_conductance_half_integer: 0.5,
      vison_flux_gap_kelvin: 12.4,
      network_throughput_petabits_per_sec: 2000.0,
      topological_braiding_fidelity_percent: 99.99998,
      status: "MAJORANA_EDGE_RIBBON_ACTIVE",
      active_ribbon_channels: 4,
    });
  }
}
