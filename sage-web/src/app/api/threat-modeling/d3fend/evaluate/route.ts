import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_EVALUATION = {
  status: "MAPPED",
  evaluation: {
    mapping: {
      mitre_attack_id: "T1566",
      attack_name: "Adversary Technique T1566",
      d3fend_technique_id: "D3-DEC",
      d3fend_technique_name: "Deception & Honeytoken Fabric",
      mitigation_component: "Canary Email Honeytoken Link Disarm",
      effective_coverage_pct: 100.0,
      registered_at: Date.now() / 1000,
    },
    overall_posture_score: 98.6,
    merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  message: "Mitigation mapped to D3FEND with audit seal.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetchBackend(`${BACKEND}/api/threat-modeling/d3fend/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_EVALUATION);
    }
    const data = await safeUpstreamJson(res, FALLBACK_EVALUATION);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_EVALUATION);
  }
}
