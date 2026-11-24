import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_manifolds_count: 3,
  firewall_events_total: 20,
  mean_eta_firewall_strength_pev: 368.2,
  mean_anomaly_suppression_db: 198.8,
  dai_freed_anomaly_phase_purity_pct: 100.0,
  spectral_boundary_condition: "NON_LOCAL_APS_PROJECTION_SEALED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/aps-eta-firewall/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
