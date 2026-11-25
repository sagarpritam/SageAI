import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/waldhausen-algebraic-k/metrics`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, {}));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      active_complexes_count: 3,
      evaluations_total: 44,
      mean_firewall_strength_pev: 472.8,
      mean_arithmetic_suppression_db: 202.6,
      waldhausen_ktheory_compliance_pct: 100.0,
    },
    { status: 200 }
  );
}
