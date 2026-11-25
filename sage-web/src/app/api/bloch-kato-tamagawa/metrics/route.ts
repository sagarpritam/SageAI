import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/bloch-kato-tamagawa/metrics`, { method: "GET" }, 8000);
    if (res.ok) return NextResponse.json(await safeUpstreamJson(res, {}));
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      active_systems_count: 3,
      evaluations_total: 200,
      mean_barrier_strength_pev: 801.0,
      mean_euler_system_suppression_db: 211.0,
      tamagawa_compliance_pct: 100.0,
    },
    { status: 200 }
  );
}
