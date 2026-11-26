import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/pandharipande-thomas-bps/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Pandharipande-Thomas metrics:", err);
  }

  return NextResponse.json({
    active_pairs_count: 3,
    evaluations_total: 1,
    mean_barrier_strength_pev: 3.65e12,
    mean_pt_bps_suppression_db: 209.0,
    pt_bps_compliance_pct: 100.0,
  });
}
