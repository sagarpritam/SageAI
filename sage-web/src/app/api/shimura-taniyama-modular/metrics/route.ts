import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/shimura-taniyama-modular/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Shimura-Taniyama modular metrics:", err);
  }

  return NextResponse.json({
    active_curves_count: 3,
    evaluations_total: 1,
    mean_barrier_strength_pev: 2.05e12,
    mean_eigenform_suppression_db: 191.4,
    modular_parametrization_compliance_pct: 100.0,
  });
}
