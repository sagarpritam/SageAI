import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SCENARIOS = {
  total: 4,
  scenarios: [
    {
      scenario_id: "SCENARIO-STUFFING-01",
      title: "Distributed Credential Stuffing & Kerberoasting Spray",
      target_pop: "POP-US-EAST",
      adversary: "APT-FIN8 (DarkSilk Financial Syndicate)",
      mitre_techniques: ["T1110.003", "T1558.003"],
      severity: "CRITICAL",
      attack_vector: "150k credential brute-force probes/min with randomized proxy rotation",
      target_service: "/api/auth/login & Active Directory Kerberos TGS",
      expected_defense: "Autonomous eBPF XDP rate limiter & Honey-Token deception trap",
      containment_sla_ms: 15.0,
      default_containment_ms: 8.4,
      status: "READY_TO_LAUNCH",
    },
    {
      scenario_id: "SCENARIO-HIJACK-02",
      title: "TLS Session Ticket Hijacking & Token Replay Injection",
      target_pop: "POP-EU-WEST",
      adversary: "APT-41 (Double Dragon Espionage)",
      mitre_techniques: ["T1539", "T1550.001"],
      severity: "CRITICAL",
      attack_vector: "Stolen ephemeral session ticket reuse & forged JWT OAuth bearer headers",
      target_service: "/api/v1/genomics/sequencing & Patient Records Ingress",
      expected_defense: "Hardware mTLS token binding re-attestation & instant revocation clamp",
      containment_sla_ms: 15.0,
      default_containment_ms: 11.2,
      status: "READY_TO_LAUNCH",
    },
    {
      scenario_id: "SCENARIO-EBPF-EVASION-03",
      title: "Kernel eBPF XDP Evasion & Fragmentation Attack",
      target_pop: "POP-US-CENTRAL",
      adversary: "Lazarus Group (Unit 180 Cyber Warfare)",
      mitre_techniques: ["T1027", "T1498.001"],
      severity: "CRITICAL",
      attack_vector: "Malformed overlapping IP packet fragments designed to evade kernel ring filters",
      target_service: "/api/infrastructure/clusters & Multi-Cloud Ingress Gateway",
      expected_defense: "Kernel XDP reassembly clamp & zero-copy IP blackhole enforcement",
      containment_sla_ms: 15.0,
      default_containment_ms: 9.7,
      status: "READY_TO_LAUNCH",
    },
    {
      scenario_id: "SCENARIO-HNDL-04",
      title: "Post-Quantum Harvest-Now-Decrypt-Later (HNDL) Key Sniffing",
      target_pop: "POP-GOV-WEST",
      adversary: "APT-28 (Fancy Bear Military Intelligence)",
      mitre_techniques: ["T1040", "T1557"],
      severity: "CRITICAL",
      attack_vector: "Passive optical splitter tap intercepting Kyber-1024 sovereign VPN tunnel",
      target_service: "GovCloud FIPS 140-3 SCIF Post-Quantum Mesh Tunnel",
      expected_defense: "Dynamic Dilithium seed re-keying in <15ms & Shannon entropy validation (>0.999)",
      containment_sla_ms: 15.0,
      default_containment_ms: 12.1,
      status: "READY_TO_LAUNCH",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/simulation/redteam-pop/scenarios`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SCENARIOS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SCENARIOS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SCENARIOS);
  }
}
