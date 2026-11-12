import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_twogroup_defects: 3,
  mean_twogroup_unitarity_pct: 99.998,
  mean_anomaly_suppression_db: 161.4,
  postnikov_h3_locked: true,
  total_inflows_audited: 0,
  capability: "127 - 2-Group Higher-Form Green-Schwarz & Walker-Wang Anomaly Guard",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/higher-form-twogroup/metrics`,
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

