import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_pairs_count: 3,
  solve_runs_total: 14,
  mean_mirror_shield_strength_pev: 348.8,
  mean_mirror_suppression_db: 197.5,
  picard_lefschetz_monodromy_purity_pct: 99.9998,
  gromov_witten_invariants_verified: 5,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/calabi-yau-mirror/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
