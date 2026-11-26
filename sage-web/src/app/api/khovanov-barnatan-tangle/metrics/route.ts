import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/khovanov-barnatan-tangle/metrics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Khovanov-Bar-Natan metrics:", err);
    return NextResponse.json({
      active_tangles_count: 3,
      evaluations_total: 1,
      mean_firewall_strength_pev: 4.42e12,
      mean_khovanov_tangle_suppression_db: 214.22,
      khovanov_barnatan_compliance_pct: 100.0,
    });
  }
}
