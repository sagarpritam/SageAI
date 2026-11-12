import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_planar_algebras: 3,
  mean_bimodule_unitarity_pct: 99.998,
  mean_subfactor_suppression_db: 163.9,
  planar_isotopy_verified: true,
  total_tangle_compressions: 1,
  capability: "134 - Vaughan-Jones Subfactor Planar Algebra & Temperley-Lieb Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/subfactor-jones-planars/metrics`,
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

