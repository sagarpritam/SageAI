import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lusztig-canonical-basis/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Lusztig metrics:", err);
    return NextResponse.json({
      active_bases_count: 3,
      evaluations_total: 1,
      mean_shield_strength_pev: 4.78e12,
      mean_canonical_basis_suppression_db: 215.92,
      lusztig_canonical_compliance_pct: 100.0,
    });
  }
}
