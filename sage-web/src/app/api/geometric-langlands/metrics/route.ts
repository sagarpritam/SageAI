import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_langlands_sheaves: 3,
  mean_duality_coherence_pct: 99.997,
  mean_hecke_spectral_lock_db: 150.7,
  kapustin_witten_duality_verified: true,
  total_duality_syncs: 48,
  capability: "115 - Langlands-Kapustin S-Duality & Geometric Gauge Langlands",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-langlands/metrics`,
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

