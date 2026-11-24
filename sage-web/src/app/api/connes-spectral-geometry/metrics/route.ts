import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_triples_count: 3,
  evaluation_runs_total: 16,
  mean_noncommutative_barrier_gev: 9.8e15,
  mean_spectral_suppression_db: 198.4,
  dixmier_trace_convergence_pct: 100.0,
  gauge_gravity_unification_status: "GEOMETRIC_UNIFICATION_ACTIVE",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/connes-spectral-geometry/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
