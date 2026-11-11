import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_celestial_boundaries: 3,
  mean_ward_fidelity_pct: 99.998,
  mean_memory_suppression_db: 155.4,
  w_infinity_chiral_lock: true,
  total_wards_sealed: 64,
  capability: "116 - Celestial Holography w_{1+infinity} & BMS4 Memory Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/celestial-holography/metrics`,
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

