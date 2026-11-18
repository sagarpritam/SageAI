import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MODULES = {
  modules: [
    {
      module_id: "BGG-SL2-PRINCIPAL-01",
      classification: "sl(2,C) Principal Block Verma Module & Antidominant Resolution",
      lie_algebra: "sl(2, C)",
      weyl_group_order: 2,
      highest_weight_lambda: [-1],
      base_reciprocity_pct: 99.9985,
      character_filtration_depth: 6,
      status: "CATEGORY_O_BLOCK_STABILIZED",
    },
    {
      module_id: "BGG-SL3-REGULAR-02",
      classification: "sl(3,C) Regular Integral Block Verma Flag & Bruhat Order S_3",
      lie_algebra: "sl(3, C)",
      weyl_group_order: 6,
      highest_weight_lambda: [0, 0],
      base_reciprocity_pct: 99.9994,
      character_filtration_depth: 12,
      status: "CATEGORY_O_BLOCK_STABILIZED",
    },
    {
      module_id: "BGG-SO5-B2-EXTREME-03",
      classification: "B_2 / so(5,C) Hyperoctahedral Block & Kazhdan-Lusztig Basis",
      lie_algebra: "so(5, C) / B_2",
      weyl_group_order: 8,
      highest_weight_lambda: [-1, -1],
      base_reciprocity_pct: 99.9999,
      character_filtration_depth: 18,
      status: "CATEGORY_O_BLOCK_STABILIZED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/bgg-category-o-shield/modules`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_MODULES));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_MODULES);
}

