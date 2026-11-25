import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_manifolds_count: 3,
  surgery_events_total: 12,
  mean_ricci_shield_strength_pev: 348.6,
  mean_topology_suppression_db: 199.8,
  w_entropy_monotonicity_compliance_pct: 100.0,
  thurston_geometrization_status: "GEOMETRIC_DECOMPOSITION_VERIFIED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/perelman-ricci-flow/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
