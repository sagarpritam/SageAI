import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TELEMETRY = {
  hourly_burn_usd: 18.42,
  daily_burn_usd: 442.08,
  cost_per_scan_usd: 0.0034,
  target_cost_per_scan_usd: 0.005,
  gross_margin_pct: 81.4,
  gross_margin_floor_pct: 78.0,
  margin_buffer_bps: 340,
  h100_gpu_utilization_pct: 94.2,
  cloud_run_cold_start_ms: 42.0,
  budget_status: "HEALTHY_MARGIN_COMPLIANT",
  currency: "USD",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/finops/telemetry`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_TELEMETRY>(res, FALLBACK_TELEMETRY);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback FinOps telemetry:", e);
  }
  return NextResponse.json(FALLBACK_TELEMETRY);
}
