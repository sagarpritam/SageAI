import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_diamagnetic_arrays: 3,
  total_harvest_events: 19,
  total_net_power_gw: 2295.0,
  zero_fossil_carbon: true,
  zero_fissile_waste: true,
  supergrid_status: "PLANETARY_MEISSNER_LEVITATION_COHERENT",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/room-temp-diamagnetic-supergrid/metrics`,
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
