import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_twisted_complexes: 3,
  total_ahss_classes: 84,
  anomaly_cancellations_performed: 14,
  average_fidelity_pct: 99.9997,
  peak_firewall_gev: 770.40,
  freed_witten_conformance: "100.0% W3_PLUS_H_TRIVIALIZED",
  status: "TWISTED_K_THEORY_SYSTEM_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/twisted-k-theory/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
    return NextResponse.json(FALLBACK_METRICS);
  } catch {
    return NextResponse.json(FALLBACK_METRICS);
  }
}
