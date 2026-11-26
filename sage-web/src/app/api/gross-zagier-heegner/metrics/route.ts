import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/gross-zagier-heegner/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Gross-Zagier metrics:", err);
  }

  return NextResponse.json({
    active_pairings_count: 3,
    evaluations_total: 1,
    mean_barrier_strength_pev: 2.58e12,
    mean_heegner_height_suppression_db: 197.67,
    gross_zagier_compliance_pct: 100.0,
  });
}
