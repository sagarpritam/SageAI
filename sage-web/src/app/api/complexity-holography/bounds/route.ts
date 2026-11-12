import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  bounds: [
    {
      bound_id: "CMP-WDW-ACTION-01",
      geometry: "BTZ AdS3 Wheeler-DeWitt Action Patch (C_A = I_WDW / pi)",
      default_central_charge: 240.0,
      default_lloyd_ratio: 0.94,
      default_switchback_shocks: 4,
      base_fidelity_pct: 99.997,
      base_suppression_db: 156.4,
      status: "COMPLEXITY_WDW_LOCKED",
    },
    {
      bound_id: "CMP-STANFORD-VOL-02",
      geometry: "AdS4 Eternal ER Bridge Extremal Volume Slice (C_V = V / G l)",
      default_central_charge: 512.0,
      default_lloyd_ratio: 0.96,
      default_switchback_shocks: 6,
      base_fidelity_pct: 99.998,
      base_suppression_db: 159.1,
      status: "COMPLEXITY_WDW_LOCKED",
    },
    {
      bound_id: "CMP-SWITCHBACK-CV2-03",
      geometry: "Shockwave Foldback Spacetime Volume 2.0 (CSW & Lloyd Bound)",
      default_central_charge: 1024.0,
      default_lloyd_ratio: 0.98,
      default_switchback_shocks: 8,
      base_fidelity_pct: 99.999,
      base_suppression_db: 161.8,
      status: "COMPLEXITY_WDW_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/complexity-holography/bounds`,
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

