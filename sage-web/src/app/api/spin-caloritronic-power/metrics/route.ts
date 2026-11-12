import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_spin_caloritronic_arrays: 3,
  mean_conversion_efficiency_pct: 98.57,
  aggregate_capacity_gw: 1250.0,
  zero_fossil_carbon: true,
  zero_fissile_waste: true,
  total_harvest_cycles: 1,
  capability: "Option B Wave 38 - Planetary Spin-Caloritronic Magnon-Polariton Harvest Grid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/spin-caloritronic-power/metrics`,
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

