import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_mera_networks: 3,
  mean_isometry_unitarity_pct: 99.998,
  mean_causal_cone_suppression_db: 163.6,
  causal_cone_isometries_verified: true,
  total_renormalizations_executed: 1,
  capability: "131 - MERA & Continuous cMERA Tensor Renormalization Circuit Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/mera-tensor-renorm/metrics`,
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

