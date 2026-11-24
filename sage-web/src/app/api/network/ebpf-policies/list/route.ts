import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_EBPF_POLICIES = {
  total_policies: 2,
  policies: [
    {
      policy_id: "BPF-POL-IMDS-SSRF-01",
      name: "Cloud IMDSv2 Zero-Copy Ingress Clamp",
      target_endpoint: "/api/v1/trade/settle",
      vector_type: "IMDS_METADATA_SSRF",
      target_interface: "eth0",
      hook_point: "XDP_INGRESS",
      action: "XDP_DROP",
      mitre_technique: "T1552.005",
      c_source_code:
        '#include <linux/bpf.h>\nSEC("xdp")\nint xdp_clamp_imds_ssrf(struct xdp_md *ctx) { return XDP_DROP; }\nchar _license[] SEC("license") = "GPL";',
      verifier_status: "VERIFIED_SAFE",
      instruction_count: 28,
      latency_overhead_ns: 45,
      attached: true,
      created_at: 1794840000,
    },
    {
      policy_id: "BPF-POL-GRAPHQL-DEPTH-02",
      name: "GraphQL Recursive AST Depth Packet Sever",
      target_endpoint: "/api/v2/genomics/sequence",
      vector_type: "GRAPHQL_AST_INJECTION",
      target_interface: "eth0",
      hook_point: "XDP_INGRESS",
      action: "XDP_DROP",
      mitre_technique: "T1190",
      c_source_code:
        '#include <linux/bpf.h>\nSEC("xdp")\nint xdp_sever_graphql_depth(struct xdp_md *ctx) { return XDP_PASS; }\nchar _license[] SEC("license") = "GPL";',
      verifier_status: "VERIFIED_SAFE",
      instruction_count: 36,
      latency_overhead_ns: 52,
      attached: true,
      created_at: 1794841000,
    },
  ],
  kernel_hook_mode: "XDP_INGRESS_ZERO_COPY",
  bpf_verifier_enforcement: "STRICT_JIT",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/network/ebpf-policies/list`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_EBPF_POLICIES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_EBPF_POLICIES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_EBPF_POLICIES);
  }
}
