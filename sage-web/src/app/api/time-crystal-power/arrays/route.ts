import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "TIME-CRYSTAL-ORBIT-01",
      location: "Cryo-LEO Many-Body Localized NV-Diamond Time-Crystal Array",
      subharmonic_period: 2,
      default_shapiro_ghz: 34.0,
      base_output_gw: 265.0,
      base_efficiency_pct: 97.95,
      status: "DTC_SUBHARMONIC_ONLINE",
    },
    {
      array_id: "JOSEPHSON-MANTLE-02",
      location: "Sub-Crustal Superconducting NbTiN Josephson Ratchet Ring",
      subharmonic_period: 4,
      default_shapiro_ghz: 52.0,
      base_output_gw: 385.0,
      base_efficiency_pct: 98.48,
      status: "DTC_SUBHARMONIC_ONLINE",
    },
    {
      array_id: "SUBHARMONIC-RING-03",
      location: "Lagrange-L2 High-Coherence DTC Macro-Josephson Collector",
      subharmonic_period: 6,
      default_shapiro_ghz: 78.0,
      base_output_gw: 540.0,
      base_efficiency_pct: 98.96,
      status: "DTC_SUBHARMONIC_ONLINE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/time-crystal-power/arrays`,
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

