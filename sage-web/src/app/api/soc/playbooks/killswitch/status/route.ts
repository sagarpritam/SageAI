import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_KILLSWITCHES = {
  killswitches: [
    {
      id: "KS-INGRESS-SEVER",
      name: "Global Cluster Public Ingress Sever",
      description:
        "Instantly clamps all public ingress traffic across 4 pilot domains via eBPF XDP zero-copy drops.",
      status: "ARMED_STANDBY",
      impact_level: "MAXIMUM_CRITICAL",
      target_layers: ["Cloudflare Edge", "AWS ALB / GKE Ingress", "eBPF XDP Layer"],
      last_toggled_at: null,
      toggled_by: null,
    },
    {
      id: "KS-EGRESS-QUARANTINE",
      name: "Global Outbound Egress Zero-Trust Quarantine",
      description:
        "Halts all outbound internet TCP/UDP sockets to terminate active exfiltration in progress.",
      status: "ARMED_STANDBY",
      impact_level: "HIGH",
      target_layers: ["Kernel Socket Probes", "Istio Egress Gateway", "CoreDNS Sinkhole"],
      last_toggled_at: null,
      toggled_by: null,
    },
    {
      id: "KS-ROTATE-ALL-SECRETS",
      name: "Fleet-Wide Secret & Canary Invalidation",
      description:
        "Revokes all active JWT tokens, rotates database credentials, and flushes session memory.",
      status: "ARMED_STANDBY",
      impact_level: "HIGH",
      target_layers: ["HashiCorp Vault", "Redis Session Store", "Deception Canaries"],
      last_toggled_at: null,
      toggled_by: null,
    },
    {
      id: "KS-FREEZE-CONTAINERS",
      name: "Cgroups v2 Container Runtime Namespace Freeze",
      description:
        "Sends SIGSTOP to all non-essential container cgroups, pausing process scheduling instantaneously.",
      status: "ARMED_STANDBY",
      impact_level: "MAXIMUM_CRITICAL",
      target_layers: ["Cgroups v2 Subsystem", "containerd / CRI-O", "Host Process Tree"],
      last_toggled_at: null,
      toggled_by: null,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/soc/playbooks/killswitch/status`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_KILLSWITCHES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_KILLSWITCHES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_KILLSWITCHES);
  }
}
