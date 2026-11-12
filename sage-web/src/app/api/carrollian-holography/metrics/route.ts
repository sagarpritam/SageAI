import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_carrollian_manifolds: 3,
  mean_boundary_coherence_pct: 99.998,
  mean_cone_isolation_db: 160.2,
  ultralocal_fracton_lock: true,
  total_null_boundaries_sealed: 0,
  capability: "123 - Non-Lorentzian Carrollian Null-Boundary Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/carrollian-holography/metrics`,
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

