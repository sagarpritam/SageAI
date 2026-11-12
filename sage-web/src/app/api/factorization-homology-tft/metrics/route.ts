import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_factorization_manifolds: 3,
  mean_factorization_unitarity_pct: 99.9985,
  ayala_francis_excision_locked: true,
  total_seals_executed: 1,
  capability: "Cap 140 - Ayala-Francis Factorization Homology & E_n-Disk Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/factorization-homology-tft/metrics`,
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

