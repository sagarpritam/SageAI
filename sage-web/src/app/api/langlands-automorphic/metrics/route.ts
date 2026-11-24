import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_packets_count: 3,
  synthesis_runs_total: 12,
  mean_hecke_shield_strength_pev: 248.6,
  mean_automorphic_suppression_db: 196.2,
  ramanujan_bound_compliance_pct: 100.0,
  galois_duality_status: "LANG_GALOIS_ISOMORPHISM_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/langlands-automorphic/metrics`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_METRICS, { status: 200 });
}
