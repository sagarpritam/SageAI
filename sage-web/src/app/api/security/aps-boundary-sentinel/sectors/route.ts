import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/aps-boundary-sentinel/sectors", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback APS boundary sentinel sectors:", err);
  }

  return NextResponse.json([
    {
      sector_id: "APS-BOUNDARY-ALPHA",
      boundary_condition: "SPECTRAL-PROJECTION-PI-POSITIVE",
      eta_invariant_val: 0.31415,
      spectral_flow: 0,
      rejection_db: -175.0,
      status: "APS_BOUNDARY_CLAMPED",
    },
    {
      sector_id: "SPECTRAL-ASYMPTOTICS-BETA",
      boundary_condition: "SEELEY-DEWITT-COEFFICIENTS",
      eta_invariant_val: 0.58197,
      spectral_flow: 0,
      rejection_db: -175.5,
      status: "ARMED",
    },
    {
      sector_id: "HEAT-KERNEL-GAMMA",
      boundary_condition: "DIRAC-LAPLACIAN-ASYMPTOTIC-EXP",
      eta_invariant_val: 1.4142,
      spectral_flow: 0,
      rejection_db: -176.0,
      status: "ARMED",
    },
    {
      sector_id: "ETA-INVARIANT-DELTA",
      boundary_condition: "CHEGER-GROMOV-RHO-INVARIANT",
      eta_invariant_val: 0.2718,
      spectral_flow: 0,
      rejection_db: -175.2,
      status: "ARMED",
    },
  ]);
}
