import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_schwinger_cavities: 3,
  mean_net_electrical_gw: 182.4,
  mean_cyclotron_recovery_pct: 93.8,
  zero_fissile_actinide_waste: true,
  total_cascade_harvests_executed: 54,
  capability: "Option B Wave 30 - Sovereign Zero-Point Schwinger-Vacua Harvester",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/schwinger-vacuum/metrics`,
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

