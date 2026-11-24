import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TUNING = {
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
  last_tuned_at: Date.now() / 1000 - 1800,
  active_rules_count: 42,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/soc/playbooks/ebpf/tuning`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TUNING);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TUNING);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TUNING);
  }
}
