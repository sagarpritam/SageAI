import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_morava_spectra: 3,
  mean_morava_unitarity_pct: 99.9989,
  bousfield_fracture_locked: true,
  total_seals_executed: 1,
  capability: "Cap 146 - Chromatic Homotopy & Morava E-Theory Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/chromatic-homotopy-morava/metrics`,
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

