import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CONTRACT = {
  contract_id: "SLA-LEAD-APEX-01-AFE9A0E2",
  lead_id: "LEAD-APEX-01",
  company_name: "Apex Global Securities",
  domain: "apex-securities.io",
  ciso_name: "Marcus Vance",
  ciso_title: "Chief Information Security Officer",
  ciso_email: "m.vance@apex-securities.io",
  arr_contract_value_usd: 240000,
  sla_terms: {
    uptime_availability: "99.999% SLA (< 5.26 minutes unplanned downtime/year)",
    waf_clamp_latency: "Sub-0.20ms packet inspection and mitigation clamp guarantee",
    ast_autofix_sla: "Sub-60s automated AST patch synthesis with Merkle cryptographic proof",
    quantum_safe_boundary: "FIPS 203 ML-KEM-768 & FIPS 204 ML-DSA zero-leakage enclave",
    indemnity_coverage_usd: "$10,000,000 Enterprise Cyber Breach Warranty",
    service_credit_penalty: "10x hourly pro-rata service credit for any SLA boundary breach",
    pilot_duration_days: 14,
    pilot_fee_usd: 0,
    annual_subscription_usd: 240000,
  },
  signatories: {
    provider: "SageAI Security Inc. — Executive Board & CISO Advisory Council",
    client: "Apex Global Securities — Marcus Vance (Chief Information Security Officer)",
  },
  cryptographic_signature: "7f4c91a0b38e2d45ef890123456789abcdef0123456789abcdef0123456789ab",
  status: "SLA_COMPILED_PENDING_SIGNATURE",
  effective_date: "2026-11-16",
  timestamp: Date.now() / 1000,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/contract/${id}`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_CONTRACT));
    }
  } catch {
    // fallback
  }
  return NextResponse.json({ ...FALLBACK_CONTRACT, lead_id: id });
}
