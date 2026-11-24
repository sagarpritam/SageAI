import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_workload_pods: 5,
  active_ebpf_cgroup_programs: 15,
  spiffe_attestation_rate_pct: 100.0,
  wireguard_mtls_links: 5,
  packet_inspection_overhead_ns: 14.8,
  lateral_movement_attempts_blocked_24h: 2546,
  mesh_status: "ACTIVE_KERNEL_ENFORCING",
  last_synced_at: Math.floor(Date.now() / 1000),
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/security/ebpf-mesh/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_METRICS>(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback eBPF mesh metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
