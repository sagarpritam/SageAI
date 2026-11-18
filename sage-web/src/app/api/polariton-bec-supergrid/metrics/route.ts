import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_polariton_arrays: 3,
  total_polariton_harvests: 21,
  total_baseload_gw: 2536.2,
  grid_stability: "NOMINAL_SUPERFLUID",
  capability: "Option B Wave 46 - Sovereign Planetary Superconducting Exciton-Polariton Supergrid",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/polariton-bec-supergrid/metrics`,
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

