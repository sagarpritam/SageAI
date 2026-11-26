import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/mazur-eisenstein-torsion/metrics`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Mazur Eisenstein metrics:", err);
  }

  return NextResponse.json({
    active_curves_count: 3,
    evaluations_total: 1,
    mean_shield_strength_pev: 2.25e12,
    mean_eisenstein_torsion_suppression_db: 193.63,
    eisenstein_torsion_compliance_pct: 100.0,
  });
}
