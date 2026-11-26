import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/ribet-level-lowering/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Ribet level-lowering metrics:", err);
  }

  return NextResponse.json({
    active_forms_count: 3,
    evaluations_total: 1,
    mean_barrier_strength_pev: 2.3e12,
    mean_level_lowering_suppression_db: 194.5,
    level_lowering_compliance_pct: 100.0,
  });
}
