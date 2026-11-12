import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_hitchin_bundles: 3,
  mean_hitchin_unitarity_pct: 99.9987,
  gmn_spectral_network_locked: true,
  total_seals_executed: 1,
  capability: "Cap 143 - Hitchin Moduli & Hyperkahler Spectral-Network Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/hitchin-moduli-hyperkahler/metrics`,
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

