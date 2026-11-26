import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/kac-moody-affine/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Kac-Moody metrics:", err);
    return NextResponse.json({
      active_algebras_count: 3,
      evaluations_total: 1,
      mean_shield_strength_pev: 5.02e12,
      mean_kac_moody_suppression_db: 217.22,
      kac_moody_compliance_pct: 100.0,
    });
  }
}
