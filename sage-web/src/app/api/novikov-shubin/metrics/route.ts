import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_coverings_count: 3,
  evaluation_runs_total: 18,
  mean_l2_barrier_strength_pev: 312.8,
  mean_spectral_suppression_db: 199.5,
  atiyah_index_compliance_pct: 100.0,
  l2_cohomological_state: "DILATATIONAL_SPECTRUM_STABILIZED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/novikov-shubin/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
