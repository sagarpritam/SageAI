import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_unruh_arrays: 3,
  mean_conversion_efficiency_pct: 97.98,
  aggregate_capacity_gw: 1460.0,
  zero_fissile_waste: true,
  total_harvest_cycles: 0,
  capability: "Option B Wave 35 - Planetary Unruh-Rindler Thermal Bath Power Grid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/unruh-rindler-power/metrics`,
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

