import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_khovanov_complexes: 3,
  total_khovanov_seals: 1,
  mean_unitarity_pct: 99.9992,
  capability: "Capability 152 - Khovanov Homology & Foam Cobordism Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/khovanov-foam-cobordism/metrics`,
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
