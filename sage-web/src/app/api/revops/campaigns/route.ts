import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CAMPAIGNS = {
  campaigns: [
    {
      campaign_id: "CAMP-FINTECH-Q4",
      name: "Global FinTech Tier-1 CISOs — Sub-Millisecond WAF & Zero-Egress PQC Pilot",
      target_vertical: "FinTech / High-Frequency Trading",
      sequence_stages: [
        "Step 1: Automated EASM Recon Briefing (Port Exposure & Subdomain Canary)",
        "Step 2: 3-Click DNS Verification Challenge & Instant Scorecard",
        "Step 3: Executive Board Deck & 14-Day Zero-Risk Virtual Pilot Agreement",
      ],
      status: "ACTIVE",
      created_at: 1731540000,
    },
    {
      campaign_id: "CAMP-HEALTHTECH-HIPAA",
      name: "HealthTech Enterprise CISOs — Zero-Knowledge HIPAA & ePHI Boundary Shield",
      target_vertical: "HealthTech / BioPharma",
      sequence_stages: [
        "Step 1: ePHI Storage Leakage & Decoy Honeytoken Simulation",
        "Step 2: Instant DNS Token Validation & Scorecard",
        "Step 3: Business Associate Agreement (BAA) + Automated Pilot Sandbox",
      ],
      status: "ACTIVE",
      created_at: 1731541000,
    },
    {
      campaign_id: "CAMP-SAAS-SOC2",
      name: "B2B SaaS Security Leaders — Continuous SOC 2 Type II AutoFix Remediation",
      target_vertical: "Cloud SaaS / DevSecOps",
      sequence_stages: [
        "Step 1: Git PR Vulnerability AutoFix & AST Patch Demo",
        "Step 2: 1-Click DNS Challenge Validation",
        "Step 3: 30-Day Enterprise Trial License with SLA Guarantees",
      ],
      status: "ACTIVE",
      created_at: 1731542000,
    },
    {
      campaign_id: "CAMP-DEFENSE-DOB",
      name: "Aerospace & Defense CISOs — FedRAMP High & Sovereign Zero-Egress Air-Gap Pilot",
      target_vertical: "Defense & Aerospace / CMMC Level 3",
      sequence_stages: [
        "Step 1: Automated EASM Recon Briefing (Perimeter Air-Gap & Port Canary)",
        "Step 2: 3-Click DNS Verification Challenge & Instant Scorecard",
        "Step 3: Classified Workload Pilot Agreement & FIPS 203/204 PQC Enclave",
      ],
      status: "ACTIVE",
      created_at: 1731543000,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/campaigns`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_CAMPAIGNS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_CAMPAIGNS);
}
