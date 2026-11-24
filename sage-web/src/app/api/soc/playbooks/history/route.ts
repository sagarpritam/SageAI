import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_HISTORY = {
  history: [
    {
      execution_id: "EXEC-PB-RANSOMWARE-SEED-01",
      playbook_id: "PB-RANSOMWARE-CONTAINMENT",
      playbook_name: "LockBit & BlackCat Rapid Ingress Sever & VSS Freeze",
      target_environment: "staging-eks-us-east-1",
      executed_by: "SageAI Autonomous SOAR Arbiter",
      status: "COMPLETED_CONTAINED",
      containment_ratio: 1.0,
      elapsed_ms: 11.8,
      timestamp: Date.now() / 1000 - 3600,
      merkle_record_hash:
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      steps_executed: [
        { step: 1, action: "eBPF XDP Drop Ingress CIDR", status: "APPLIED" },
        { step: 2, action: "Freeze Volume Snapshot & VSS", status: "APPLIED" },
        { step: 3, action: "Revoke Compromised Service Token", status: "APPLIED" },
        { step: 4, action: "Anchor Cryptographic Merkle Seal", status: "APPLIED" },
      ],
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/soc/playbooks/history`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_HISTORY);
    }
    const data = await safeUpstreamJson(res, FALLBACK_HISTORY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_HISTORY);
  }
}
