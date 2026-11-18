import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_category_o_blocks: 3,
  total_verma_seals: 12,
  average_reciprocity_pct: 99.9996,
  max_representation_barrier_db: 184.2,
  bgg_duality_status: "KAZHDAN_LUSZTIG_INVARIANTS_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/bgg-category-o-shield/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_METRICS);
}

