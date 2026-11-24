import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LEAKS = [
  {
    leak_id: "LEAK-APEX-9921",
    domain: "apex-securities.io",
    company_name: "Apex Global Securities",
    threat_actor: "APT-FIN8",
    underground_source: "BreachForums / Telegram Russian Market",
    leak_title: "Targeted Trader Webhook SSRF & AWS IMDSv2 Exploit Stash",
    severity: "CRITICAL",
    exposed_elements: ["API Endpoints", "Trader Subnets", "IMDS Probe Signatures"],
    preemptive_ebpf_policy_id: "BPF-POL-PREDICT-APEX",
    status: "PREEMPTIVELY_SHIELDED",
    discovered_at: Date.now() / 1000 - 7200,
  },
  {
    leak_id: "LEAK-NEXUS-4412",
    domain: "nexusbiohealth.com",
    company_name: "Nexus BioHealth Global",
    threat_actor: "APT-41",
    underground_source: "XSS Underground Forum / Darknet Paste",
    leak_title: "Genomic Sequence Endpoint FastQ Exfiltration PoC",
    severity: "HIGH",
    exposed_elements: ["FHIR API Schemas", "Biomarker Upload Endpoints"],
    preemptive_ebpf_policy_id: null,
    status: "MONITORING_ACTIVE",
    discovered_at: Date.now() / 1000 - 5400,
  },
  {
    leak_id: "LEAK-HYPER-8819",
    domain: "hyperscale.dev",
    company_name: "HyperScale Cloud Systems",
    threat_actor: "Lazarus Group",
    underground_source: "Dread Onion Network / Exploit.in",
    leak_title: "Kubernetes Pod Container Escape & Seccomp Bypass Weapon",
    severity: "CRITICAL",
    exposed_elements: ["Kubelet Endpoints", "ServiceAccount Token Patterns"],
    preemptive_ebpf_policy_id: "BPF-POL-PREDICT-HYPER",
    status: "PREEMPTIVELY_SHIELDED",
    discovered_at: Date.now() / 1000 - 3600,
  },
  {
    leak_id: "LEAK-VANGUARD-0114",
    domain: "vanguard-aero.def",
    company_name: "Vanguard Aerospace & Defense Systems",
    threat_actor: "APT-28",
    underground_source: "Sovereign State-Sponsored Threat Feed / IntelX",
    leak_title: "SCIF Airgap Egress Relay & SCADA Protocol Decryption Notes",
    severity: "CRITICAL",
    exposed_elements: ["Airgap Sentinel Configs", "SCADA Relay Ports"],
    preemptive_ebpf_policy_id: "BPF-POL-PREDICT-VANGUARD",
    status: "AIRGAP_CONTAINED",
    discovered_at: Date.now() / 1000 - 1800,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const fallback = domain ? FALLBACK_LEAKS.filter((l) => l.domain === domain) : FALLBACK_LEAKS;

  try {
    const query = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    const res = await fetchBackend(`${BACKEND}/api/intelligence/panopticon/leaks${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(fallback);
    }
    const data = await safeUpstreamJson(res, fallback);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallback);
  }
}
