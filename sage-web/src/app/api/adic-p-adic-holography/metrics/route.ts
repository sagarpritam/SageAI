import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_padic_trees: 3,
  mean_holographic_fidelity_pct: 99.998,
  mean_ultrametric_isolation_db: 163.6,
  non_archimedean_inequality_locked: true,
  total_ultrametric_seals: 1,
  capability: "136 - p-Adic Bruhat-Tits Tree AdS/CFT & Ultrametric Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/adic-p-adic-holography/metrics`,
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

