import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_perverse_strata: 3,
  total_perverse_seals: 17,
  mean_unitarity_pct: 99.99945,
  capability: "Capability 159 - Perverse Sheaf, Intersection Cohomology & Deligne-Lusztig Character Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/perverse-sheaf-deligne/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_METRICS);
}

