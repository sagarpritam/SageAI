import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_jt_topologies: 3,
  mean_matrix_fidelity_pct: 99.998,
  mean_wormhole_suppression_db: 160.2,
  sss_spectral_curve_locked: true,
  total_genera_sealed: 0,
  capability: "125 - JT Dilaton Wormhole & Double-Scaled Matrix Model Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/jt-wormhole-matrix/metrics`,
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

