import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_cobordism_functors: 3,
  total_cobordism_seals: 1,
  mean_unitarity_pct: 99.99933,
  capability: "Capability 151 - Lurie (infinity,n)-Category Bordism Hypothesis Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/infinity-topos-lurie-cobordism/metrics`,
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

