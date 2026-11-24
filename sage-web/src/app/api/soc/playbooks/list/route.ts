import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PLAYBOOKS = {
  total_count: 4,
  playbooks: [
    {
      playbook_id: "PB-RANSOMWARE-CONTAINMENT",
      name: "LockBit & BlackCat Rapid Ingress Sever & VSS Freeze",
      severity: "CRITICAL",
      category: "MALWARE_CONTAINMENT",
      mitre_techniques: ["T1486", "T1490", "T1027"],
      description:
        "Dynamically drops attacker subnet via eBPF XDP, invalidates cloud tokens, freezes container volume mounts, and anchors incident on Merkle ledger.",
      estimated_duration_ms: 12.5,
      automated: true,
      steps: [
        { step: 1, action: "eBPF XDP Drop Ingress CIDR", target: "Kernel Interface xdp0" },
        { step: 2, action: "Freeze Volume Snapshot & VSS", target: "CSI Driver / AWS EBS" },
        { step: 3, action: "Revoke Compromised Service Token", target: "OAuth2 / Vault KMS" },
        { step: 4, action: "Anchor Cryptographic Merkle Seal", target: "Immutable Audit Ledger" },
      ],
    },
    {
      playbook_id: "PB-APT-C2-TERMINATION",
      name: "APT Stealth C2 Beaconing Sever & DNS Sinkhole",
      severity: "CRITICAL",
      category: "NETWORK_INTERCEPTION",
      mitre_techniques: ["T1071.001", "T1071.004", "T1572"],
      description:
        "Intercepts high-entropy DNS exfiltration, injects eBPF TCP RSTs on C2 sockets, and routes malicious domain lookups to internal sinkhole honeypot.",
      estimated_duration_ms: 8.4,
      automated: true,
      steps: [
        { step: 1, action: "Inspect eBPF Socket Ring Buffer", target: "sys_enter_connect" },
        { step: 2, action: "Enforce eBPF TCP RST Injection", target: "Outbound C2 Sockets" },
        { step: 3, action: "Sinkhole Malicious Domain Resolution", target: "CoreDNS / BIND9" },
        { step: 4, action: "Rotate Compromised Node API Keys", target: "IAM Secrets Manager" },
      ],
    },
    {
      playbook_id: "PB-CLOUD-IMDS-LOCKDOWN",
      name: "Cloud IMDSv2 Zero-Trust Enclave & SSRF Lockdown",
      severity: "HIGH",
      category: "CLOUD_SECURITY",
      mitre_techniques: ["T1552.005", "T1190"],
      description:
        "Clamps link-local 169.254.169.254 traversal across all cluster pods, enforces Istio Envoy strict egress deny, and re-attests workload SPIFFE identities.",
      estimated_duration_ms: 6.8,
      automated: true,
      steps: [
        { step: 1, action: "Clamp 169.254.169.254 via eBPF XDP", target: "All Node Interfaces" },
        { step: 2, action: "Enforce Istio Strict Egress Authorization", target: "Envoy Sidecar Mesh" },
        { step: 3, action: "Re-Attest Workload SPIFFE/SPIRE SVID", target: "Kubernetes Pod Mesh" },
        { step: 4, action: "Dispatch CISO Telemetry Notice", target: "Slack / SecOps SIEM" },
      ],
    },
    {
      playbook_id: "PB-SUPPLY-CHAIN-QUARANTINE",
      name: "Software Supply Chain Dependency Poisoning Cut-Off",
      severity: "HIGH",
      category: "APPSEC_GOVERNANCE",
      mitre_techniques: ["T1195.001", "T1195.002"],
      description:
        "Severs outbound network connections to untrusted package repositories, runs AST AutoFix to excise compromised imports, and regenerates SBOM attestation.",
      estimated_duration_ms: 15.2,
      automated: true,
      steps: [
        { step: 1, action: "Sever Registry Ingress (PyPI / NPM)", target: "Build Agent Egress" },
        { step: 2, action: "Invoke AST AutoFix Module Depoisoning", target: "Codebase AST Parser" },
        { step: 3, action: "Generate CycloneDX / OpenVEX Attestation", target: "Supply Chain Ledger" },
        { step: 4, action: "Seal Cryptographic Dependency Proof", target: "Merkle Root Ledger" },
      ],
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/soc/playbooks/list`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_PLAYBOOKS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_PLAYBOOKS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_PLAYBOOKS);
  }
}
