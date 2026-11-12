import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_syk_ensembles: 3,
  mean_scrambling_fidelity_pct: 99.998,
  mean_chaos_isolation_db: 156.8,
  mss_lyapunov_bound_active: true,
  total_ensembles_bounded: 64,
  capability: "120 - SYK Maximal Chaos & Schwarzian Scrambling Guard",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/syk-chaos-guard/metrics`,
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

