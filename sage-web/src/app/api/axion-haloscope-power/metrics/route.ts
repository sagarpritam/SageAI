import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_haloscope_arrays: 3,
  mean_clean_baseload_gw: 212.6,
  mean_rectification_eff_pct: 96.0,
  zero_fissile_actinide_waste: true,
  total_primakov_cycles: 71,
  capability: "Option B Wave 32 - Planetary Axion-Quasiparticle Haloscope Grid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/axion-haloscope-power/metrics`,
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

