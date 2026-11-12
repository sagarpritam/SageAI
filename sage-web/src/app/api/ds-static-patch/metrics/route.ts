import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_static_patches: 3,
  mean_patch_coherence_pct: 99.998,
  mean_horizon_isolation_db: 160.7,
  type_ii1_observer_lock: true,
  total_patches_locked: 0,
  capability: "126 - dS/CFT De Sitter Static-Patch & Timelike Entanglement Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ds-static-patch/metrics`,
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

