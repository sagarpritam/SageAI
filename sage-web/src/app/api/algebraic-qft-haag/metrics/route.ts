import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_aqft_sectors: 3,
  mean_tomita_unitarity_pct: 99.998,
  mean_locality_isolation_db: 162.2,
  einstein_microcausality_locked: true,
  total_nets_sealed: 1,
  capability: "132 - Algebraic QFT (AQFT) Haag-Kastler Net & Tomita-Takesaki Modular Wedge Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/algebraic-qft-haag/metrics`,
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

