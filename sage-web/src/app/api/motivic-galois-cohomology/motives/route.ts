import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  motives: [
    {
      motive_id: "MOTIVE-MIXED-TATE-01",
      sector: "Mixed Tate Motive Z(n) Multiple Zeta Period Cage",
      default_tate_weight: 4,
      default_beilinson_order: 6,
      default_hodge_rank: 8,
      base_unitarity_pct: 99.9974,
      base_suppression_db: 161.8,
      status: "MOTIVIC_PERIOD_LOCKED",
    },
    {
      motive_id: "VOEVODSKY-A1-HOMOTOPY-02",
      sector: "Voevodsky DM(k) Milnor-Bloch-Kato Algebraic Cycle Shield",
      default_tate_weight: 6,
      default_beilinson_order: 8,
      default_hodge_rank: 12,
      base_unitarity_pct: 99.9982,
      base_suppression_db: 163.9,
      status: "MOTIVIC_PERIOD_LOCKED",
    },
    {
      motive_id: "COSMIC-GALOIS-PERIOD-03",
      sector: "Connes-Marcolli Cosmic Galois Group G_mot Feynman Motive",
      default_tate_weight: 8,
      default_beilinson_order: 10,
      default_hodge_rank: 16,
      base_unitarity_pct: 99.9991,
      base_suppression_db: 166.5,
      status: "MOTIVIC_PERIOD_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/motivic-galois-cohomology/motives`,
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

