import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/connes-spectral-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Connes Spectral sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "CONNES-SPECTRAL-CORE-ALPHA",
      algebra_representation: "A-INVOLUTIVE-SMOOTH",
      dixmier_trace_integral: 1.0,
      spectral_dimension: 4,
      rejection_db: -170.0,
      status: "ARMED",
    },
    {
      sector_id: "DIXMIER-TRACE-INTEGRATION-BETA",
      algebra_representation: "TR-OMEGA-COMPACT-OPERATOR",
      dixmier_trace_integral: 0.5,
      spectral_dimension: 4,
      rejection_db: -170.5,
      status: "ARMED",
    },
    {
      sector_id: "CYCLIC-COHOMOLOGY-GAMMA",
      algebra_representation: "CONNES-CHERN-CHARACTER-HC",
      dixmier_trace_integral: 2.0,
      spectral_dimension: 4,
      rejection_db: -171.0,
      status: "ARMED",
    },
    {
      sector_id: "REAL-STRUCTURE-J-DELTA",
      algebra_representation: "TOMITA-TAKESAKI-MODULAR-J",
      dixmier_trace_integral: 0.25,
      spectral_dimension: 4,
      rejection_db: -170.2,
      status: "ARMED",
    },
  ]);
}
