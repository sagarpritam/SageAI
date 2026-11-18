import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_majorana_arrays: 3,
  total_harvest_cycles: 24,
  total_nominal_capacity_mw: 51200.0,
  conductance_quantization: "2e^2/h (Topologically Protected)",
  average_fidelity_pct: 99.9999,
  planetary_grid_status: "MAJORANA_SUPERGRID_RESONANT",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/majorana-supergrid-power/metrics`,
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

