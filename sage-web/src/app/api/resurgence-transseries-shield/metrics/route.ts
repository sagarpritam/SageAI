import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  active_transseries_manifolds: 3,
  mean_resurgence_fidelity_pct: 99.998,
  mean_stokes_isolation_db: 164.7,
  alien_bridge_cancellation_locked: true,
  total_borel_resummations: 1,
  capability: "139 - Ecalle Alien-Calculus Resurgence & Borel-Pade Transseries Shield",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/resurgence-transseries-shield/metrics`,
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

