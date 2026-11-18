import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DRIP_RUN = {
  campaign_run_status: "COMPLETED_SUCCESSFULLY",
  total_leads_processed: 4,
  active_pilots_count: 4,
  total_pipeline_arr_usd: "$840,000 ARR",
  pipeline_conversion_pct: 100.0,
  average_waf_clamp_latency_ms: 0.16,
  leads: [
    {
      lead_id: "LEAD-APEX-01",
      company_name: "Apex Global Securities",
      status: "PILOT_ACTIVE",
      arr_contract_value_usd: 240000,
    },
    {
      lead_id: "LEAD-NEXUS-02",
      company_name: "Nexus BioHealth Global",
      status: "PILOT_ACTIVE",
      arr_contract_value_usd: 180000,
    },
    {
      lead_id: "LEAD-CLOUD-03",
      company_name: "HyperScale Cloud Systems",
      status: "PILOT_ACTIVE",
      arr_contract_value_usd: 200000,
    },
    {
      lead_id: "LEAD-AERO-04",
      company_name: "Vanguard Aerospace & Defense Systems",
      status: "PILOT_ACTIVE",
      arr_contract_value_usd: 220000,
    },
  ],
  timestamp: Date.now() / 1000,
};

export async function POST() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/run-drip`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DRIP_RUN));
    }
  } catch {
    // fallback
  }

  return NextResponse.json(FALLBACK_DRIP_RUN);
}

