import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ACTORS = [
  {
    actor_id: "APT-FIN8",
    aliases: ["FIN8", "Sentry Panda", "ATK 113"],
    origin: "Eastern Europe",
    targeted_vertical: "Financial & Capital Markets",
    associated_domain: "apex-securities.io",
    attack_vector: "Trader Webhook IMDSv2 Credential Spray",
    c2_infrastructure: ["194.26.29.114", "91.240.118.82"],
    mitigation_policy: "BPF-POL-PREDICT-APEX",
    de_masked_status: "DE_MASKED_CONTAINED",
  },
  {
    actor_id: "APT-41",
    aliases: ["Double Dragon", "BARIUM", "Axiom", "Winnti"],
    origin: "East Asia",
    targeted_vertical: "Biotech & Healthcare Diagnostics",
    associated_domain: "nexusbiohealth.com",
    attack_vector: "Genomic FastQ FHIR API Exfiltration",
    c2_infrastructure: ["103.145.13.88", "118.193.41.22"],
    mitigation_policy: "BPF-PREDICT-7A9B1C",
    de_masked_status: "DE_MASKED_CONTAINED",
  },
  {
    actor_id: "Lazarus Group",
    aliases: ["HIDDEN COBRA", "Guardians of Peace", "Zinc"],
    origin: "East Asia (State-Sponsored)",
    targeted_vertical: "Cloud Infrastructure & HyperScalers",
    associated_domain: "hyperscale.dev",
    attack_vector: "Kubernetes Pod Escape & Seccomp Bypass",
    c2_infrastructure: ["185.220.101.5", "175.45.176.10"],
    mitigation_policy: "BPF-POL-PREDICT-HYPER",
    de_masked_status: "DE_MASKED_CONTAINED",
  },
  {
    actor_id: "APT-28",
    aliases: ["Fancy Bear", "Sofacy", "Strontium", "Sednit"],
    origin: "Eastern Europe (GRU Military Intel)",
    targeted_vertical: "Aerospace & Sovereign Defense",
    associated_domain: "vanguard-aero.def",
    attack_vector: "SCIF Airgap Egress Relay & SCADA Protocol Decryption",
    c2_infrastructure: ["91.240.118.201", "185.141.63.120"],
    mitigation_policy: "BPF-POL-PREDICT-VANGUARD",
    de_masked_status: "DE_MASKED_CONTAINED",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/intelligence/sinkhole/actors`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_ACTORS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_ACTORS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_ACTORS);
  }
}
