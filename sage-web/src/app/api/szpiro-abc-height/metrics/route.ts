import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/szpiro-abc-height/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Szpiro ABC metrics:", err);
  }

  return NextResponse.json({
    active_bounds_count: 3,
    evaluations_total: 1,
    mean_shield_strength_pev: 2.78e12,
    mean_abc_radical_suppression_db: 199.9,
    szpiro_abc_compliance_pct: 100.0,
  });
}
