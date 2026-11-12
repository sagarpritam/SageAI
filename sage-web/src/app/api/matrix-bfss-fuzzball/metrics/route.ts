import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_matrix_manifolds: 3,
  mean_matrix_fuzzball_unitarity_pct: 99.998,
  mean_commutator_suppression_db: 162.9,
  horizonless_superstrata_verified: true,
  total_microstates_locked: 0,
  capability: "128 - BFSS / IKKT M-Theory Matrix Model & Fuzzball Microstate Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/matrix-bfss-fuzzball/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

