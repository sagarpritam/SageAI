import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  modules: [
    {
      module_id: "LIQUID-SCHOLZE-P05-01",
      classification: "Clausen-Scholze Liquid Banach p=0.5 Analytic Module",
      default_liquid_exponent: 0.5,
      default_stone_rank: 16,
      default_ext_vanishing_degree: 6,
      base_unitarity_pct: 99.9976,
      base_suppression_db: 162.8,
      status: "CONDENSED_MODULE_LOCKED",
    },
    {
      module_id: "SOLID-PROFINITE-Z-02",
      classification: "Solidification Profinite Z_hat^square Condensed Module",
      default_liquid_exponent: 0.75,
      default_stone_rank: 24,
      default_ext_vanishing_degree: 8,
      base_unitarity_pct: 99.9984,
      base_suppression_db: 165.0,
      status: "CONDENSED_MODULE_LOCKED",
    },
    {
      module_id: "PYKNOTIC-RING-MOD-03",
      classification: "Pyknotic Analytic Ring Ext^i-Acyclic Stack Module",
      default_liquid_exponent: 0.92,
      default_stone_rank: 32,
      default_ext_vanishing_degree: 10,
      base_unitarity_pct: 99.9992,
      base_suppression_db: 167.3,
      status: "CONDENSED_MODULE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/condensed-liquid-mathematics/modules`,
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

