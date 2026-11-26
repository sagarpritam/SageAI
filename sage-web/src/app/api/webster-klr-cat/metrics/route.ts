import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webster-klr-cat/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Webster KLR metrics:", err);
    return NextResponse.json({
      active_algebras_count: 3,
      evaluations_total: 1,
      mean_shield_strength_pev: 4.54e12,
      mean_klr_suppression_db: 214.67,
      webster_klr_compliance_pct: 100.0,
    });
  }
}
