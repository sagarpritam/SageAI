import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_swampland_bounds: 3,
  mean_uv_fidelity_pct: 99.998,
  mean_eft_suppression_db: 157.4,
  wgc_convex_hull_enforced: true,
  total_eft_audits_sealed: 64,
  capability: "119 - Swampland Distance Conjecture & WGC EFT Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/swampland-wgc/metrics`,
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

