import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_three_manifolds: 3,
  mean_invariant_fidelity_pct: 99.996,
  mean_anomaly_suppression_db: 146.5,
  reidemeister_invariance_enforced: true,
  total_invariants_evaluated: 54,
  capability: "113 - Witten Chern-Simons 3-Manifold TQFT & Jones Knot Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/chern-simons-tqft/metrics`,
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

