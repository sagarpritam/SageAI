import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_topos_sites: 3,
  mean_topos_unitarity_pct: 99.998,
  mean_sheaf_suppression_db: 164.3,
  lawvere_tierney_certified: true,
  total_sheaf_seals: 1,
  capability: "137 - Grothendieck Topos Site Sheaf & Logic-Classifier Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/topos-grothendieck-firewall/metrics`,
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

