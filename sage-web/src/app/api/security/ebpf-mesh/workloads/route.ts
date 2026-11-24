import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_WORKLOADS = [
  {
    pod_id: "pod-auth-api-7b89f",
    namespace: "identity-mesh",
    service_account: "auth-service-sa",
    spiffe_id: "spiffe://sageai.io/ns/identity-mesh/sa/auth-service-sa",
    cgroup_v2_id: "cg-28491",
    wireguard_peer: "wg-peer-useast-01",
    policy_state: "ENFORCING_ALLOW_EGRESS",
    packets_scanned: 849200,
    drops_24h: 142,
    status: "HEALTHY_ATTESTED",
  },
  {
    pod_id: "pod-payment-gateway-9c41a",
    namespace: "pci-vault",
    service_account: "payment-broker-sa",
    spiffe_id: "spiffe://sageai.io/ns/pci-vault/sa/payment-broker-sa",
    cgroup_v2_id: "cg-99120",
    wireguard_peer: "wg-peer-useast-02",
    policy_state: "ENFORCING_STRICT_ISOLATION",
    packets_scanned: 1284500,
    drops_24h: 38,
    status: "HEALTHY_ATTESTED",
  },
  {
    pod_id: "pod-scanner-worker-4d22e",
    namespace: "security-core",
    service_account: "scanner-worker-sa",
    spiffe_id: "spiffe://sageai.io/ns/security-core/sa/scanner-worker-sa",
    cgroup_v2_id: "cg-31405",
    wireguard_peer: "wg-peer-uscent-01",
    policy_state: "ENFORCING_ALLOW_EGRESS",
    packets_scanned: 2109400,
    drops_24h: 412,
    status: "HEALTHY_ATTESTED",
  },
  {
    pod_id: "pod-adversary-canary-6f11c",
    namespace: "honeynet-quarantine",
    service_account: "canary-bait-sa",
    spiffe_id: "spiffe://sageai.io/ns/honeynet-quarantine/sa/canary-bait-sa",
    cgroup_v2_id: "cg-77812",
    wireguard_peer: "wg-peer-eucentral-01",
    policy_state: "SUSPICIOUS_LATERAL_PROBE",
    packets_scanned: 94200,
    drops_24h: 1890,
    status: "SUSPICIOUS_ANOMALY",
  },
  {
    pod_id: "pod-ai-inference-8e99b",
    namespace: "ml-engine",
    service_account: "tensor-worker-sa",
    spiffe_id: "spiffe://sageai.io/ns/ml-engine/sa/tensor-worker-sa",
    cgroup_v2_id: "cg-54129",
    wireguard_peer: "wg-peer-asiaeast-01",
    policy_state: "ENFORCING_ALLOW_EGRESS",
    packets_scanned: 3950000,
    drops_24h: 64,
    status: "HEALTHY_ATTESTED",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/security/ebpf-mesh/workloads`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_WORKLOADS>(res, FALLBACK_WORKLOADS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback eBPF workloads:", e);
  }
  return NextResponse.json(FALLBACK_WORKLOADS);
}
