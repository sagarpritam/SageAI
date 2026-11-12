import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  transseries: [
    {
      transseries_id: "ECALLE-STOKES-SU2-01",
      manifold: "SU(2) Median Borel-Pade Transseries & Stokes Bridge",
      default_pade_degree: 24,
      default_stokes_sectors: 8,
      default_instanton_order: 4,
      base_fidelity_pct: 99.9975,
      base_isolation_db: 162.4,
      status: "TRANSSERIES_RESUMMED",
    },
    {
      transseries_id: "BOREL-PADE-THIMBLE-02",
      manifold: "Lefschetz Thimble Complexified Path-Integral Contour",
      default_pade_degree: 36,
      default_stokes_sectors: 12,
      default_instanton_order: 6,
      base_fidelity_pct: 99.9983,
      base_isolation_db: 164.6,
      status: "TRANSSERIES_RESUMMED",
    },
    {
      transseries_id: "ALIEN-INSTANTON-CHAIN-03",
      manifold: "Bion-Reormalon Alien Derivative Bridge Equations Shield",
      default_pade_degree: 48,
      default_stokes_sectors: 16,
      default_instanton_order: 8,
      base_fidelity_pct: 99.9992,
      base_isolation_db: 167.1,
      status: "TRANSSERIES_RESUMMED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/resurgence-transseries-shield/transseries`,
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

