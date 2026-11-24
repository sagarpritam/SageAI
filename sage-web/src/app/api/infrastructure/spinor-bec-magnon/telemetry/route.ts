import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/spinor-bec-magnon/telemetry");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Spinor BEC telemetry:", err);
    return NextResponse.json({
      bus_id: "SPINOR-BEC-BUS-01",
      spinor_manifold: "SPIN_1_FERROMAGNETIC_BEC_SO3_BROKEN_SYMMETRY",
      optical_bus_throughput_pbps: 5200.0,
      spin_stiffness_nj_m: 2.45,
      transverse_spin_fidelity_percent: 99.999999,
      status: "SPINOR_BEC_MAGNON_BUS_ACTIVE",
      active_magnon_channels: 4,
    });
  }
}
