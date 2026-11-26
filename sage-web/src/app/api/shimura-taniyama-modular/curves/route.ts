import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/shimura-taniyama-modular/curves`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Shimura-Taniyama modular curves:", err);
  }

  return NextResponse.json({
    curves: [
      {
        curve_id: "SHIMURA-X0-11-ELLIPTIC-01",
        name: "X_0(11) Weight-2 Cusp Eigenform Parametrization",
        conductor_level: 11,
        q_expansion_defect: 1e-18,
        shimura_barrier_strength_pev: 1.95e12,
        eigenform_suppression_db: 191.0,
        status: "SHIMURA_TANIYAMA_MODULAR_LOCKED",
      },
      {
        curve_id: "SHIMURA-X0-37-RANK1-02",
        name: "X_0(37) Rank-1 Modular Eigenform Barrier",
        conductor_level: 37,
        q_expansion_defect: 1.2e-18,
        shimura_barrier_strength_pev: 2.05e12,
        eigenform_suppression_db: 191.5,
        status: "SHIMURA_TANIYAMA_MODULAR_LOCKED",
      },
      {
        curve_id: "SHIMURA-HEEGNER-SHIMURA-03",
        name: "Heegner Point & Gross-Zagier Shimura Lattice",
        conductor_level: 43,
        q_expansion_defect: 1.4e-18,
        shimura_barrier_strength_pev: 2.15e12,
        eigenform_suppression_db: 191.8,
        status: "SHIMURA_TANIYAMA_MODULAR_LOCKED",
      },
    ],
  });
}
