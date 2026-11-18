import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TARGETS = {
  targets: [
    {
      domain: "apex-securities.io",
      company_name: "Apex Global Securities",
      lead_id: "LEAD-APEX-01",
      ciso_name: "Marcus Vance",
      ciso_email: "m.vance@apex-securities.io",
      industry: "FinTech / Capital Markets",
      arr_usd: 240000,
      threat_actor: "APT-FIN8 (DarkSilk Financial Syndicate)",
      attack_vector: "Cloud IMDSv2 SSRF & High-Frequency Trading Parameter Tampering",
      target_endpoint: "/api/v1/trade/settle",
    },
    {
      domain: "nexusbiohealth.com",
      company_name: "Nexus BioHealth Global",
      lead_id: "LEAD-NEXUS-02",
      ciso_name: "Dr. Sarah Lin",
      ciso_email: "s.lin@nexusbiohealth.com",
      industry: "HealthTech / Genomics",
      arr_usd: 180000,
      threat_actor: "APT-41 (Barium Bio-Espionage Cell)",
      attack_vector: "GraphQL AST Recursive Depth Injection & HIPAA Genomic Sequence SSRF",
      target_endpoint: "/api/v2/genomics/sequence",
    },
    {
      domain: "hyperscale.dev",
      company_name: "HyperScale Cloud Systems",
      lead_id: "LEAD-HYPER-03",
      ciso_name: "Alex Chen",
      ciso_email: "a.chen@hyperscale.dev",
      industry: "Cloud SaaS / DevSecOps",
      arr_usd: 200000,
      threat_actor: "Lazarus Group (CloudHopper Ingress Unit)",
      attack_vector: "Kubernetes Kubelet API SSRF (:10250) & Container Breakout Exploit",
      target_endpoint: "/api/k8s/cluster/provision",
    },
    {
      domain: "vanguard-aero.def",
      company_name: "Vanguard Aerospace & Defense Systems",
      lead_id: "LEAD-VANGUARD-04",
      ciso_name: "Elena Rostova",
      ciso_email: "e.rostova@vanguard-aero.def",
      industry: "Defense / FedRAMP High",
      arr_usd: 220000,
      threat_actor: "APT-28 (Fancy Bear Aerospace Infiltration)",
      attack_vector: "Software Supply Chain Dependency Typosquatting & Satellite Telemetry Injection",
      target_endpoint: "/api/v1/telemetry/ingest",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/simulation/enterprise-drill/targets`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TARGETS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TARGETS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TARGETS);
  }
}
