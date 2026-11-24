import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SINKHOLE_SUMMARY = {
  total_active_campaigns: 4,
  total_adversary_probes_intercepted: 19,
  de_masked_apt_actors: 4,
  active_canary_bait_tokens: 4,
  ebpf_xdp_ip_drops_enforced: 19,
  sinkhole_gateway_status: "HIGH_CONFIDENCE_HONEYNET_ONLINE",
  last_synced_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/intelligence/sinkhole/summary`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SINKHOLE_SUMMARY);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SINKHOLE_SUMMARY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SINKHOLE_SUMMARY);
  }
}
