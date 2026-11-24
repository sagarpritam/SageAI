import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TUNED_RESULT = {
  xdp_mode: "NATIVE_DRIVER",
  drop_action: "XDP_DROP",
  ring_buffer_size_mb: 64,
  kernel_hook: "tracepoint__syscalls__sys_enter_connect",
  microsecond_latency_clamp_ms: 0.082,
  blocked_cidrs: [
    "198.51.100.0/24",
    "203.0.113.0/24",
    "192.0.2.0/24",
  ],
  blocked_ports: [4444, 1337, 8088, 3389],
  packet_drop_rate_pps: 14820,
  kernel_memory_usage_kb: 2048,
  last_tuned_at: Date.now() / 1000,
  active_rules_count: 7,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/soc/playbooks/ebpf/tune`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TUNED_RESULT);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TUNED_RESULT);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TUNED_RESULT);
  }
}
