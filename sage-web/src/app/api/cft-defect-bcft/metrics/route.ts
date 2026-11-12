import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_bcft_interfaces: 3,
  mean_bcft_unitarity_pct: 99.998,
  mean_defect_isolation_db: 161.6,
  g_theorem_monotone_locked: true,
  total_interfaces_sealed: 0,
  capability: "129 - Boundary CFT (BCFT) Defect Line & g-Theorem RG Interface Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cft-defect-bcft/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

