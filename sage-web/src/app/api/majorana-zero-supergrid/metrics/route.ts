import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_majorana_arrays: 3,
  total_harvest_cycles: 24,
  mean_conversion_efficiency_pct: 99.06,
  aggregate_capacity_gw: 1629.0,
  zero_carbon_compliance: true,
  milestone: "Option B Wave 45 - Planetary Non-Abelian Majorana Zero-Mode Supergrid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/majorana-zero-supergrid/metrics`,
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
