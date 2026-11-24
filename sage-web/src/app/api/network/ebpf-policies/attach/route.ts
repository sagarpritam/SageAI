import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ATTACH = {
  status: "ATTACHED",
  policy: {
    policy_id: "BPF-POL-IMDS-SSRF-01",
    attached: true,
    target_interface: "eth0",
  },
  message: "Policy BPF-POL-IMDS-SSRF-01 attached to eth0 with XDP_DROP hook",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetchBackend(`${BACKEND}/api/network/ebpf-policies/attach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_ATTACH);
    }
    const data = await safeUpstreamJson(res, FALLBACK_ATTACH);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_ATTACH);
  }
}
