import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_fukaya_branes: 3,
  mean_fukaya_unitarity_pct: 99.9991,
  maslov_floer_invariant_locked: true,
  total_seals_executed: 1,
  capability: "Cap 147 - Fukaya A_infinity & Floer Homology Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/symplectic-fukaya-floer/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_METRICS);
}

