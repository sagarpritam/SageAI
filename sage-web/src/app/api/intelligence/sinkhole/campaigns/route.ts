import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CAMPAIGNS = [
  {
    campaign_id: "SINK-APEX-01",
    domain: "apex-securities.io",
    company_name: "Apex Global Securities",
    targeted_actor: "APT-FIN8",
    bait_type: "CANARY_AWS_STS_AND_TRADER_WEBHOOK",
    canary_token_id: "CANARY-STS-APEX-771",
    underground_channel: "BreachForums / Russian Market Telegram",
    sinkhole_listener_url: "https://sinkhole.sageai.io/beacon/apex-sts-probe",
    status: "ACTIVE_HONEYPOT",
    intercept_count: 5,
    last_intercept: {
      adversary_ip: "194.26.29.114",
      asn: "AS44477 (Dancom Ltd)",
      country: "Russia",
      city: "St. Petersburg",
      user_agent: "curl/7.88.1-custom-fin8-probe",
      threat_actor: "APT-FIN8",
      attribution_confidence_pct: 99.2,
      attack_type: "IMDS_CREDENTIAL_PROBE",
      intercepted_at: Date.now() / 1000 - 3600,
      ebpf_action: "XDP_DROP_APPLIED",
    },
    created_at: Date.now() / 1000 - 86400 * 3,
  },
  {
    campaign_id: "SINK-NEXUS-02",
    domain: "nexusbiohealth.com",
    company_name: "Nexus BioHealth Global",
    targeted_actor: "APT-41",
    bait_type: "CANARY_FHIR_CLINICAL_FASTQ_BEACON",
    canary_token_id: "CANARY-FHIR-NEXUS-902",
    underground_channel: "XSS Underground Forum / Darknet Paste",
    sinkhole_listener_url: "https://sinkhole.sageai.io/beacon/nexus-fhir-sync",
    status: "ACTIVE_HONEYPOT",
    intercept_count: 4,
    last_intercept: {
      adversary_ip: "103.145.13.88",
      asn: "AS13335 (Cloud Network China)",
      country: "China",
      city: "Chengdu",
      user_agent: "Python-urllib/3.11 Winnti/Dropper",
      threat_actor: "APT-41",
      attribution_confidence_pct: 98.4,
      attack_type: "GENOMIC_API_EXFIL_ATTEMPT",
      intercepted_at: Date.now() / 1000 - 7200,
      ebpf_action: "XDP_DROP_APPLIED",
    },
    created_at: Date.now() / 1000 - 86400 * 3,
  },
  {
    campaign_id: "SINK-HYPER-03",
    domain: "hyperscale.dev",
    company_name: "HyperScale Cloud Systems",
    targeted_actor: "Lazarus Group",
    bait_type: "CANARY_KUBECONFIG_CONTAINER_ESCAPE",
    canary_token_id: "CANARY-KUBE-HYPER-314",
    underground_channel: "Dread Onion Network / Exploit.in",
    sinkhole_listener_url: "https://sinkhole.sageai.io/beacon/hyper-kube-drain",
    status: "ACTIVE_HONEYPOT",
    intercept_count: 6,
    last_intercept: {
      adversary_ip: "185.220.101.5",
      asn: "AS208323 (Pyongyang Tor Exit Gateway)",
      country: "North Korea (Proxy)",
      city: "Pyongyang",
      user_agent: "kubectl/v1.28.2 (linux/amd64) Lazarus/Weapon",
      threat_actor: "Lazarus Group",
      attribution_confidence_pct: 99.7,
      attack_type: "KUBELET_CONTAINER_ESCAPE_WEAPON",
      intercepted_at: Date.now() / 1000 - 1800,
      ebpf_action: "XDP_DROP_APPLIED",
    },
    created_at: Date.now() / 1000 - 86400 * 3,
  },
  {
    campaign_id: "SINK-VANGUARD-04",
    domain: "vanguard-aero.def",
    company_name: "Vanguard Aerospace & Defense Systems",
    targeted_actor: "APT-28",
    bait_type: "CANARY_SCADA_MODBUS_MTLS_CERT",
    canary_token_id: "CANARY-SCADA-VANGUARD-108",
    underground_channel: "Sovereign State-Sponsored Threat Feed / IntelX",
    sinkhole_listener_url: "https://sinkhole.sageai.io/beacon/vanguard-scada-relay",
    status: "ACTIVE_HONEYPOT",
    intercept_count: 4,
    last_intercept: {
      adversary_ip: "91.240.118.201",
      asn: "AS51659 (GlavNII Special Comm)",
      country: "Russia",
      city: "Moscow",
      user_agent: "Go-http-client/1.1 FancyBear/ModbusPoll",
      threat_actor: "APT-28",
      attribution_confidence_pct: 98.9,
      attack_type: "SCADA_AIRGAP_RELAY_PROBE",
      intercepted_at: Date.now() / 1000 - 900,
      ebpf_action: "XDP_DROP_APPLIED",
    },
    created_at: Date.now() / 1000 - 86400 * 3,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const fallback = domain ? FALLBACK_CAMPAIGNS.filter((c) => c.domain === domain) : FALLBACK_CAMPAIGNS;

  try {
    const query = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    const res = await fetchBackend(`${BACKEND}/api/intelligence/sinkhole/campaigns${query}`, {
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
