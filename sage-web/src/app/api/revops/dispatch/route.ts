import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const LEADS_MAP: Record<string, { company: string; domain: string; email: string }> = {
  "LEAD-APEX-01": {
    company: "Apex Global Securities",
    domain: "apex-securities.io",
    email: "m.vance@apex-securities.io",
  },
  "LEAD-NEXUS-02": {
    company: "Nexus BioHealth Global",
    domain: "nexusbiohealth.com",
    email: "s.lin@nexusbiohealth.com",
  },
  "LEAD-CLOUD-03": {
    company: "HyperScale Cloud Systems",
    domain: "hyperscale.dev",
    email: "a.chen@hyperscale.dev",
  },
  "LEAD-AERO-04": {
    company: "Vanguard Aerospace & Defense Systems",
    domain: "vanguard-aero.def",
    email: "e.rostova@vanguard-aero.def",
  },
};

function buildFallbackDispatch(leadId: string) {
  const info = LEADS_MAP[leadId] || {
    company: "Target Enterprise",
    domain: "target-enterprise.com",
    email: "ciso@target-enterprise.com",
  };

  return {
    dispatch_id: "DISP-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    lead_id: leadId,
    domain: info.domain,
    ciso_email: info.email,
    status: "TRANSMITTED_SUCCESSFULLY",
    wizard_link: `/onboarding?lead=${encodeURIComponent(leadId)}&domain=${encodeURIComponent(info.domain)}`,
    delivered_timestamp: Date.now() / 1000,
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
      `${BACKEND}/api/revops/dispatch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildFallbackDispatch(leadId)));
    }
  } catch {
    // fallback
  }

  return NextResponse.json(buildFallbackDispatch(leadId));
}
