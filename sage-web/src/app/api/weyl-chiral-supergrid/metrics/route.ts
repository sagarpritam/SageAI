import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_weyl_arrays: 3,
  mean_conversion_efficiency_pct: 99.0,
  aggregate_capacity_gw: 1568.0,
  zero_fossil_carbon: true,
  zero_fissile_waste: true,
  total_harvest_cycles: 1,
  capability: "Option B Wave 44 - Planetary Chiral Topological Weyl Supergrid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/weyl-chiral-supergrid/metrics`,
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
