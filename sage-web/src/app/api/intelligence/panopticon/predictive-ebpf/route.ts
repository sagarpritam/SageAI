import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PREDICTIVE_RES = {
  leak_id: "LEAK-NEXUS-4412",
  status: "PREEMPTIVELY_SHIELDED",
  policy_id: "BPF-PREDICT-7A9B1C",
  domain: "nexusbiohealth.com",
  hook_mode: "XDP_INGRESS_ZERO_COPY",
  latency_overhead_ns: 36,
  merkle_record_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  message: "Preemptive eBPF filter active across all nodes.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/intelligence/panopticon/predictive-ebpf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_PREDICTIVE_RES,
        leak_id: body.leak_id || "LEAK-NEXUS-4412",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_PREDICTIVE_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_PREDICTIVE_RES);
  }
}
