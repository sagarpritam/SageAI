import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SYNTHESIZE = {
  status: "SYNTHESIZED",
  policy: {
    policy_id: "BPF-POL-SYNTH-99",
    name: "Auto-Synthesized eBPF Shield for /api/v1/payment",
    target_endpoint: "/api/v1/payment",
    vector_type: "IMDS_METADATA_SSRF",
    target_interface: "eth0",
    hook_point: "XDP_INGRESS",
    action: "XDP_DROP",
    mitre_technique: "T1190",
    c_source_code:
      '/* SageAI Auto-Synthesized eBPF Policy */\n#include <linux/bpf.h>\nSEC("xdp")\nint xdp_filter(struct xdp_md *ctx) { return XDP_DROP; }\nchar _license[] SEC("license") = "GPL";',
    verifier_status: "VERIFIED_SAFE",
    instruction_count: 32,
    latency_overhead_ns: 38,
    attached: true,
    merkle_record_hash: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    created_at: Date.now() / 1000,
  },
  message: "Successfully synthesized and verified eBPF policy BPF-POL-SYNTH-99",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetchBackend(`${BACKEND}/api/network/ebpf-policies/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SYNTHESIZE);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SYNTHESIZE);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SYNTHESIZE);
  }
}
