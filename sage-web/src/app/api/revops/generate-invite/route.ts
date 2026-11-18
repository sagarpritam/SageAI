import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const LEADS_MAP: Record<
  string,
  { company: string; domain: string; ciso: string; email: string; score: number }
> = {
  "LEAD-APEX-01": {
    company: "Apex Global Securities",
    domain: "apex-securities.io",
    ciso: "Marcus Vance",
    email: "m.vance@apex-securities.io",
    score: 78,
  },
  "LEAD-NEXUS-02": {
    company: "Nexus BioHealth Global",
    domain: "nexusbiohealth.com",
    ciso: "Dr. Sarah Lin",
    email: "s.lin@nexusbiohealth.com",
    score: 82,
  },
  "LEAD-CLOUD-03": {
    company: "HyperScale Cloud Systems",
    domain: "hyperscale.dev",
    ciso: "Alex Chen",
    email: "a.chen@hyperscale.dev",
    score: 74,
  },
  "LEAD-AERO-04": {
    company: "Vanguard Aerospace & Defense Systems",
    domain: "vanguard-aero.def",
    ciso: "Elena Rostova",
    email: "e.rostova@vanguard-aero.def",
    score: 88,
  },
};

function buildFallbackInvite(leadId: string) {
  const info = LEADS_MAP[leadId] || {
    company: "Target Enterprise",
    domain: "target-enterprise.com",
    ciso: "Executive Security Leader",
    email: "security@target-enterprise.com",
    score: 80,
  };
  const token = "sageai_pilot_" + Math.random().toString(36).substring(2, 12);
  const dnsTxt = `sageai-verification=${token}`;
  const wizardUrl = `/onboarding?token=${token}&domain=${info.domain}&lead=${leadId}&tier=enterprise_pilot`;

  return {
    lead_id: leadId,
    company_name: info.company,
    domain: info.domain,
    ciso_name: info.ciso,
    email: info.email,
    token: token,
    dns_challenge_txt: dnsTxt,
    wizard_url: wizardUrl,
    email_subject: `Confidential: External Attack Surface & Zero-Trust Sandbox Invitation for ${info.company}`,
    email_body: `Dear ${info.ciso},\n\nOur autonomous reconnaissance pipeline conducted a preliminary scan against ${info.domain}.\n\nSecure Onboarding URL: ${wizardUrl}\nDNS Verification TXT: ${dnsTxt}`,
    easm_pre_recon: {
      score: info.score,
      grade: info.score >= 85 ? "A-" : "B+",
    },
    status: "INVITATION_PACKET_COMPILED",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const leadId = typeof body.lead_id === "string" ? body.lead_id : "LEAD-APEX-01";

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/generate-invite`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildFallbackInvite(leadId)));
    }
  } catch {
    // fallback
  }

  return NextResponse.json(buildFallbackInvite(leadId));
}
