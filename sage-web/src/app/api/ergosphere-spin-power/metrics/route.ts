import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_ergosphere_rotors: 3,
  aggregate_clean_capacity_gw: 859.3,
  mean_conversion_efficiency_pct: 97.03,
  zero_fossil_carbon: true,
  total_torque_extractions: 64,
  option_b: "Wave 33 - Superradiant Penrose-BZ Ergosphere Power Matrix",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ergosphere-spin-power/metrics`,
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

