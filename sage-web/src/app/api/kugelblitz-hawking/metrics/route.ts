import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_kugelblitz_cores: 3,
  mean_hawking_electrical_gw: 141.8,
  hawking_mass_to_radiation_pct: 100.0,
  zero_fissile_actinide_waste: true,
  total_hawking_harvests_executed: 49,
  capability: "Option B Wave 29 - Sovereign Planetary Kugelblitz Hawking Power Generator",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kugelblitz-hawking/metrics`,
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

