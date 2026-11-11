import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  corridors: [
    {
      corridor_id: "LENTZ-SOLITON-LEO-GEO-01",
      route: "Sub-Orbital Equatorial Sling <-> Geostationary Transfer Corridor",
      base_cruise_c: 0.18,
      base_confinement_efficiency_pct: 94.6,
      nominal_soliton_power_gw: 185.0,
      status: "SOLITON_CORRIDOR_READY",
    },
    {
      corridor_id: "LENTZ-CISLUNAR-L1-02",
      route: "Earth-Moon Lagrange L1 <-> Lunar South Pole Shackleton Relay",
      base_cruise_c: 0.28,
      base_confinement_efficiency_pct: 95.1,
      nominal_soliton_power_gw: 210.0,
      status: "SOLITON_CORRIDOR_READY",
    },
    {
      corridor_id: "LENTZ-HELIOCENTRIC-03",
      route: "Lagrange L4/L5 Interplanetary Rapid-Response Metric Conduit",
      base_cruise_c: 0.42,
      base_confinement_efficiency_pct: 95.4,
      nominal_soliton_power_gw: 240.0,
      status: "SOLITON_CORRIDOR_READY",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/alcubierre-lentz-warp/corridors`,
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

