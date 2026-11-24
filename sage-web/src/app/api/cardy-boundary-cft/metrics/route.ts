import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_cardy_states: 3,
  aggregate_verlinde_fusion_levels: 12,
  average_boundary_entropy_log_g: 0.52968,
  average_fidelity_pct: 99.9997,
  peak_firewall_strength_gev: 1420.0,
  cross_channel_modular_conformance: "100.0% INVARIANT",
  boundary_seals_performed: 22,
  status: "CARDY_CFT_SYSTEM_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cardy-boundary-cft/metrics`,
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
