import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/moore-read-pfaffian/channels", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Moore-Read Pfaffian channels:", err);
  }

  return NextResponse.json([
    {
      channel_id: "PFAFFIAN-MAJORANA-ALPHA",
      channel_name: "Moore-Read e/4 Pfaffian Waveguide",
      fractional_charge_e: 0.25,
      majorana_phase_rad: 0.7854,
      channel_throughput_pbps: 1450.0,
      non_abelian_coherence_ratio: 1.0,
      status: "MAJORANA_PHASE_TUNED",
    },
    {
      channel_id: "NEUTRAL-FERMION-EDGE-BETA",
      channel_name: "Neutral Chiral Majorana Fermion Edge Mode",
      fractional_charge_e: 0.0,
      majorana_phase_rad: 1.5708,
      channel_throughput_pbps: 1450.0,
      non_abelian_coherence_ratio: 1.0,
      status: "CHIRAL_EDGE_ACTIVE",
    },
    {
      channel_id: "NON-ABELIAN-BRAID-GAMMA",
      channel_name: "Ising Anyon Braiding Matrix Interconnect",
      fractional_charge_e: 0.25,
      majorana_phase_rad: 2.3562,
      channel_throughput_pbps: 1450.0,
      non_abelian_coherence_ratio: 1.0,
      status: "BRAIDING_MATRIX_OPTIMAL",
    },
    {
      channel_id: "CHG-QUARTER-VORTEX-DELTA",
      channel_name: "Half-Quantum Vortex e/4 Flux Core",
      fractional_charge_e: 0.25,
      majorana_phase_rad: 3.1416,
      channel_throughput_pbps: 1450.0,
      non_abelian_coherence_ratio: 1.0,
      status: "HALF_QUANTUM_VORTEX_PINNED",
    },
  ]);
}
