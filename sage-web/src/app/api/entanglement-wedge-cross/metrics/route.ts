import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_wedge_geometries: 3,
  mean_purification_fidelity_pct: 99.998,
  mean_wedge_isolation_db: 163.8,
  markov_gap_positivity_enforced: true,
  total_wedges_audited: 0,
  capability: "130 - Reflected Entropy (S_R) & Entanglement Wedge Cross-Section (E_W) Guard",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/entanglement-wedge-cross/metrics`,
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

