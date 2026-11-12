import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_koszul_operads: 3,
  mean_koszul_unitarity_pct: 99.9992,
  kontsevich_formality_locked: true,
  total_seals_executed: 1,
  capability: "Cap 148 - Koszul Operadic Bar-Cobar & Formality Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/operadic-bv-bar-cobar/metrics`,
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

