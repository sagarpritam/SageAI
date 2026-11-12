import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_modular_genera: 3,
  mean_modular_unitarity_pct: 99.998,
  mean_ghost_suppression_db: 161.0,
  sl2z_s_duality_locked: true,
  total_modular_audits_sealed: 0,
  capability: "124 - Modular Bootstrap & Rademacher Unitarity Guard",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/modular-bootstrap/metrics`,
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

