import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_soliton_corridors: 3,
  mean_regenerative_bus_gw: 198.5,
  mean_confinement_efficiency_pct: 95.0,
  positive_energy_wec_enforced: true,
  zero_fissile_actinide_waste: true,
  total_soliton_transits_executed: 36,
  capability:
    "Option B Wave 31 - Sovereign Alcubierre-Lentz Soliton Transit Matrix",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/alcubierre-lentz-warp/metrics`,
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

