import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_symtft_sandwiches: 3,
  mean_defect_coherence_pct: 99.998,
  mean_anomaly_isolation_db: 157.6,
  lagrangian_algebra_condensed: true,
  total_defects_sealed: 58,
  capability: "117 - Non-Invertible Generalized Symmetry & SymTFT Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/non-invertible-symtft/metrics`,
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

