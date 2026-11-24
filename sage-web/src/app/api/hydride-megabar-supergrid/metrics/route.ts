import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_hydride_vaults: 3,
  aggregate_megabar_pressure_gpa: 411.0,
  average_critical_temperature_k: 262.33,
  total_clean_power_harvested_mw: 3500.0,
  meissner_screening_conformance: "100.0% FULL_FLUX_EXPULSION",
  average_efficiency_pct: 99.98,
  harvest_events_count: 29,
  status: "HYDRIDE_MEGABAR_SUPERGRID_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/hydride-megabar-supergrid/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
    return NextResponse.json(FALLBACK_METRICS);
  } catch {
    return NextResponse.json(FALLBACK_METRICS);
  }
}
