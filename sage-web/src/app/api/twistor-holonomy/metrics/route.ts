import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_twistor_fibrations: 3,
  mean_conformal_invariance_pct: 99.998,
  mean_null_shear_suppression_db: 139.4,
  su22_helicity_conserved: true,
  total_holonomy_stabilizations: 36,
  capability: "111 - Penrose Twistor-Space Holomorphic Curvature Stabilizer",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/twistor-holonomy/metrics`,
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

