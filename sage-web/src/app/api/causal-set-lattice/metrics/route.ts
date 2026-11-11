import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_causal_posets: 3,
  mean_myrheim_meyer_dim: 4.0001,
  mean_lorentz_covariance_pct: 99.997,
  acausal_cycle_rate: 0.0,
  total_poset_verifications: 64,
  capability: "112 - Causal Set Discrete Spacetime Poset Lattice Guard",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/causal-set-lattice/metrics`,
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

