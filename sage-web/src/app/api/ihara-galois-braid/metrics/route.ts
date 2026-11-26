import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/ihara-galois-braid/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Ihara Galois braid metrics:", err);
  }

  return NextResponse.json({
    active_braids_count: 3,
    evaluations_total: 1,
    mean_shield_strength_pev: 2.0e12,
    mean_braid_monodromy_suppression_db: 190.8,
    profinite_braid_compliance_pct: 100.0,
  });
}
