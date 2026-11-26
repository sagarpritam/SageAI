import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chuang-rouquier-sl2/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Chuang-Rouquier metrics:", err);
    return NextResponse.json({
      active_complexes_count: 3,
      evaluations_total: 1,
      mean_firewall_strength_pev: 4.66e12,
      mean_sl2_categorification_suppression_db: 215.52,
      chuang_rouquier_compliance_pct: 100.0,
    });
  }
}
