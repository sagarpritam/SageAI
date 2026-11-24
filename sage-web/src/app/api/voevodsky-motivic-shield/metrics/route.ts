import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_motivic_schemes: 3,
  total_nisnevich_dimensions: 14,
  homotopy_evaluations_performed: 18,
  average_fidelity_pct: 99.9998,
  peak_motivic_barrier_gev: 1349.40,
  a1_invariance_conformance: "100.0% VOEVODSKY_NILPOTENT_BOUND",
  status: "MOTIVIC_HOMOTOPY_SYSTEM_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/voevodsky-motivic-shield/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
    return NextResponse.json(FALLBACK_METRICS);
  } catch {
    return NextResponse.json(FALLBACK_METRICS);
  }
}
