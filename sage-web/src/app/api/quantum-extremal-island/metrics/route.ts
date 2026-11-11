import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_qes_horizons: 3,
  mean_unitarity_fidelity_pct: 99.997,
  mean_firewall_quench_db: 151.4,
  amps_firewall_free: true,
  total_page_audits: 42,
  capability: "114 - AdS/BCFT Takayanagi Island QES & Page Curve Auditor",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/quantum-extremal-island/metrics`,
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

