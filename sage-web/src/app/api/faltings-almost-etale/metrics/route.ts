import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/faltings-almost-etale/metrics`,
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
      active_schemes_count: 3,
      evaluations_total: 135,
      mean_shield_strength_pev: 692.5,
      mean_galois_suppression_db: 204.8,
      almost_etale_compliance_pct: 100.0,
    },
    { status: 200 }
  );
}
