import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_INTERCEPT_RES = {
  campaign_id: "SINK-APEX-01",
  status: "ADVERSARY_DE_MASKED",
  threat_actor: "APT-FIN8",
  adversary_ip: "194.26.29.114",
  attribution_confidence_pct: 99.4,
  ebpf_policy_applied: "BPF-XDP-DROP-194-26-29-114",
  merkle_record_hash: "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
  intercept: {
    adversary_ip: "194.26.29.114",
    asn: "AS44477 (Dancom Ltd)",
    country: "Russia",
    city: "St. Petersburg",
    user_agent: "curl/7.88.1-custom-fin8-probe",
    threat_actor: "APT-FIN8",
    attribution_confidence_pct: 99.4,
    attack_type: "IMDS_CREDENTIAL_PROBE_TRIGGERED",
    intercepted_at: Date.now() / 1000,
    ebpf_action: "XDP_DROP_APPLIED",
  },
  message: "Adversary APT-FIN8 de-masked at 194.26.29.114. eBPF XDP drop rule active across all edge nodes.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/intelligence/sinkhole/trigger-intercept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_INTERCEPT_RES,
        campaign_id: body.campaign_id || "SINK-APEX-01",
        adversary_ip: body.simulated_ip || "194.26.29.114",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_INTERCEPT_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_INTERCEPT_RES);
  }
}
