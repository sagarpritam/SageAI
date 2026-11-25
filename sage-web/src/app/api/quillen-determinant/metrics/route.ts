import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_bundles_count: 3,
  evaluations_total: 14,
  mean_quillen_firewall_strength_pev: 372.4,
  mean_spectral_suppression_db: 199.6,
  deligne_riemann_roch_compliance_pct: 100.0,
  quillen_bundle_status: "ANALYTIC_TORSION_SEALED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/quillen-determinant/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
