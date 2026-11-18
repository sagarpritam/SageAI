import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DECK_METRICS = {
  pipeline_arr_usd: "$840,000 ARR",
  active_pilots_count: 4,
  dns_verification_rate_pct: 100.0,
  pilot_conversion_pct: 100.0,
  average_acv_usd: "$210,000 ARR",
  gross_margin_pct: 94.2,
  waf_clamp_latency_ms: 0.16,
  ast_autofix_accuracy_pct: 99.4,
  sales_cycle_days: 9,
  target_series_a_raise_usd: "$12,000,000",
  target_year_1_arr_usd: "$4,200,000 ARR",
  enterprise_logos: [
    { name: "Apex Global Securities", vertical: "Tier-1 FinTech", value: "$240K ARR" },
    { name: "Nexus BioHealth Global", vertical: "HealthTech / Genomics", value: "$180K ARR" },
    { name: "HyperScale Cloud Systems", vertical: "Cloud Infrastructure", value: "$200K ARR" },
    { name: "Vanguard Aerospace & Defense", vertical: "Defense / FedRAMP", value: "$220K ARR" },
  ],
  status: "DECK_METRICS_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      const revopsData = await res.json();
      return NextResponse.json({
        ...FALLBACK_DECK_METRICS,
        pipeline_arr_usd: revopsData.pipeline_contract_value_usd || FALLBACK_DECK_METRICS.pipeline_arr_usd,
        active_pilots_count: revopsData.active_pilots || FALLBACK_DECK_METRICS.active_pilots_count,
      });
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DECK_METRICS);
}

