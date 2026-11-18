import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LEADS = {
  leads: [
    {
      lead_id: "LEAD-APEX-01",
      company_name: "Apex Global Securities",
      domain: "apex-securities.io",
      ciso_name: "Marcus Vance",
      ciso_title: "Chief Information Security Officer",
      email: "m.vance@apex-securities.io",
      industry: "FinTech / Capital Markets",
      campaign_id: "CAMP-FINTECH-Q4",
      arr_contract_value_usd: 240000,
      easm_pre_recon: {
        score: 78,
        grade: "B+",
        attack_surface_assets: 142,
        open_critical_ports: [443, 8443, 9443],
        cve_exposures: ["CVE-2026-0322", "CVE-2026-88772"],
        threat_level: "MODERATE_ELEVATED",
      },
      status: "INVITED",
      dispatched_at: 1731543000,
    },
    {
      lead_id: "LEAD-NEXUS-02",
      company_name: "Nexus BioHealth Global",
      domain: "nexusbiohealth.com",
      ciso_name: "Dr. Sarah Lin",
      ciso_title: "VP & Chief Trust Officer",
      email: "s.lin@nexusbiohealth.com",
      industry: "HealthTech / Genomics",
      campaign_id: "CAMP-HEALTHTECH-HIPAA",
      arr_contract_value_usd: 180000,
      easm_pre_recon: {
        score: 82,
        grade: "B+",
        attack_surface_assets: 98,
        open_critical_ports: [443, 8080],
        cve_exposures: ["CVE-2026-104935"],
        threat_level: "MODERATE",
      },
      status: "INVITED",
      dispatched_at: 1731544000,
    },
    {
      lead_id: "LEAD-CLOUD-03",
      company_name: "HyperScale Cloud Systems",
      domain: "hyperscale.dev",
      ciso_name: "Alex Chen",
      ciso_title: "Head of Information Security",
      email: "a.chen@hyperscale.dev",
      industry: "Cloud SaaS / Infrastructure",
      campaign_id: "CAMP-SAAS-SOC2",
      arr_contract_value_usd: 200000,
      easm_pre_recon: {
        score: 74,
        grade: "B",
        attack_surface_assets: 215,
        open_critical_ports: [443, 6443, 8000],
        cve_exposures: ["CVE-2026-0322", "CVE-2026-76519"],
        threat_level: "HIGH_PERIMETER_SURFACE",
      },
      status: "CHALLENGE_VERIFIED",
      dispatched_at: 1731545000,
    },
    {
      lead_id: "LEAD-AERO-04",
      company_name: "Vanguard Aerospace & Defense Systems",
      domain: "vanguard-aero.def",
      ciso_name: "Elena Rostova",
      ciso_title: "VP of Cyber Defense & Mission Assurance",
      email: "e.rostova@vanguard-aero.def",
      industry: "Defense & Aerospace / Mission Critical",
      campaign_id: "CAMP-DEFENSE-DOB",
      arr_contract_value_usd: 220000,
      easm_pre_recon: {
        score: 88,
        grade: "A-",
        attack_surface_assets: 310,
        open_critical_ports: [443, 2222, 8443],
        cve_exposures: ["CVE-2026-0322", "CVE-2026-9921"],
        threat_level: "CRITICAL_DEFENSE_PERIMETER",
      },
      status: "QUALIFIED",
      dispatched_at: 1731546000,
    },
  ],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaign_id");
  const query = campaignId ? `?campaign_id=${encodeURIComponent(campaignId)}` : "";

  const filteredFallback = {
    leads: campaignId
      ? FALLBACK_LEADS.leads.filter((l) => l.campaign_id === campaignId)
      : FALLBACK_LEADS.leads,
  };

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/leads${query}`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, filteredFallback));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(filteredFallback);
}
