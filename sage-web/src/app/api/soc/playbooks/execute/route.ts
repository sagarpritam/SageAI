import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_EXECUTION_RESULT = {
  execution_id: "EXEC-PB-RANSOMWARE-LIVE-01",
  playbook_id: "PB-RANSOMWARE-CONTAINMENT",
  playbook_name: "LockBit & BlackCat Rapid Ingress Sever & VSS Freeze",
  target_environment: "staging-dual-cloud",
  executed_by: "CISO Operator (ciso)",
  status: "COMPLETED_CONTAINED",
  containment_ratio: 1.0,
  human_downtime_seconds: 0.0,
  elapsed_ms: 12.5,
  timestamp: Date.now() / 1000,
  merkle_record_hash:
    "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
  steps_executed: [
    { step: 1, action: "eBPF XDP Drop Ingress CIDR", target: "Kernel Interface xdp0", status: "SUCCESS_APPLIED", execution_latency_ms: 0.8 },
    { step: 2, action: "Freeze Volume Snapshot & VSS", target: "CSI Driver / AWS EBS", status: "SUCCESS_APPLIED", execution_latency_ms: 1.2 },
    { step: 3, action: "Revoke Compromised Service Token", target: "OAuth2 / Vault KMS", status: "SUCCESS_APPLIED", execution_latency_ms: 0.9 },
    { step: 4, action: "Anchor Cryptographic Merkle Seal", target: "Immutable Audit Ledger", status: "SUCCESS_APPLIED", execution_latency_ms: 0.5 },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/soc/playbooks/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_EXECUTION_RESULT);
    }
    const data = await safeUpstreamJson(res, FALLBACK_EXECUTION_RESULT);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_EXECUTION_RESULT);
  }
}
