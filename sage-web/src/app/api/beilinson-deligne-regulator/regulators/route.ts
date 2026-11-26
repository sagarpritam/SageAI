import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/beilinson-deligne-regulator/regulators`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Beilinson regulators:", err);
  }

  return NextResponse.json({
    regulators: [
      {
        regulator_id: "BEILINSON-REGULATOR-K2-01",
        name: "Beilinson K_2 Motivic Regulator & L(E,2) Barrier",
        chow_weight: 2,
        regulator_defect: 1e-18,
        beilinson_barrier_strength_pev: 3.02e12,
        regulator_suppression_db: 203.0,
        status: "BEILINSON_REGULATOR_LOCKED",
      },
      {
        regulator_id: "DELIGNE-COHOMOLOGY-02",
        name: "Deligne-Beilinson Hodge Cycle Regulator Shield",
        chow_weight: 3,
        regulator_defect: 1.1e-18,
        beilinson_barrier_strength_pev: 3.12e12,
        regulator_suppression_db: 203.5,
        status: "BEILINSON_REGULATOR_LOCKED",
      },
      {
        regulator_id: "HIGHER-CHOW-MOTIVE-03",
        name: "Bloch Higher Chow CH^p(X, n) Motivic Lattice",
        chow_weight: 4,
        regulator_defect: 1.2e-18,
        beilinson_barrier_strength_pev: 3.22e12,
        regulator_suppression_db: 204.0,
        status: "BEILINSON_REGULATOR_LOCKED",
      },
    ],
  });
}
