import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  yangians: [
    {
      yangian_id: "YANGIAN-SL4-RMATRIX-01",
      classification: "Rational Yangian Y(sl_4) R-Matrix & RTT Exchange Algebra",
      default_yangian_rank: 4,
      default_bethe_roots: 16,
      default_baxter_depth: 12,
      base_unitarity_pct: 99.9986,
      base_suppression_db: 165.5,
      status: "YANGIAN_RTT_LOCKED",
    },
    {
      yangian_id: "BAXTER-QOP-XXZ-02",
      classification: "Trigonometric U_q(sl_2^) XXZ Spin-Chain Baxter T-Q Relation",
      default_yangian_rank: 6,
      default_bethe_roots: 24,
      default_baxter_depth: 16,
      base_unitarity_pct: 99.9993,
      base_suppression_db: 167.4,
      status: "YANGIAN_RTT_LOCKED",
    },
    {
      yangian_id: "Q-AFFINE-E8-SOLITON-03",
      classification: "Frenkel-Reshetikhin q-Character E_8 Kirillov-Reshetikhin Module",
      default_yangian_rank: 8,
      default_bethe_roots: 32,
      default_baxter_depth: 22,
      base_unitarity_pct: 99.9998,
      base_suppression_db: 169.6,
      status: "YANGIAN_RTT_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kashiwara-quantum-affine-yangian/yangians`,
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

