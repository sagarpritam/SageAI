import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/laughlin-quasiparticle-bus/channels", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Laughlin Quasiparticle channels:", err);
  }

  return NextResponse.json([
    {
      channel_id: "LAUGHLIN-NU-ONE-THIRD-ALPHA",
      channel_name: "Laughlin e/3 Anyon Quasiparticle Waveguide",
      fractional_charge_e: 0.3333,
      braiding_phase_rad: 1.0472,
      channel_throughput_pbps: 1400.0,
      thermal_conductance_ratio: 1.0,
      status: "ANYONIC_CHARGE_ROUTED",
    },
    {
      channel_id: "FRACTIONAL-STATISTICS-BETA",
      channel_name: "Fractional Statistical Angle Phase Shifter",
      fractional_charge_e: 0.3333,
      braiding_phase_rad: 1.0472,
      channel_throughput_pbps: 1400.0,
      thermal_conductance_ratio: 1.0,
      status: "STATISTICAL_ANGLE_TUNED",
    },
    {
      channel_id: "THERMAL-HALL-ZERO-GAMMA",
      channel_name: "Chiral Edge Mode Dissipationless Transport",
      fractional_charge_e: 0.3333,
      braiding_phase_rad: 2.0944,
      channel_throughput_pbps: 1400.0,
      thermal_conductance_ratio: 1.0,
      status: "DISSIPATIONLESS_EDGE_ACTIVE",
    },
    {
      channel_id: "COMPOSITE-FERMION-DELTA",
      channel_name: "Composite Fermion 2-Flux Vortex Core",
      fractional_charge_e: 0.3333,
      braiding_phase_rad: 3.1416,
      channel_throughput_pbps: 1400.0,
      thermal_conductance_ratio: 1.0,
      status: "VORTEX_CORE_PINNED",
    },
  ]);
}
