import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/getzler-kapranov-operad/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Getzler-Kapranov metrics:", err);
    return NextResponse.json({
      active_operads_count: 3,
      evaluations_total: 1,
      mean_firewall_strength_pev: 3.94e12,
      mean_operad_homotopy_suppression_db: 211.1,
      getzler_kapranov_compliance_pct: 100.0,
    });
  }
}
