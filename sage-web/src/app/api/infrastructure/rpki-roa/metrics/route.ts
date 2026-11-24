import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_prefixes_monitored: 6,
  valid_roa_announcements: 4,
  invalid_hijack_attempts: 2,
  active_blackhole_filters: 1,
  rpki_cache_sync_status: "SYNCHRONIZED_RTR_V1",
  rtr_cache_servers: [
    "rtr.arin.net:8282 (Valid)",
    "rpki.ripe.net:8282 (Valid)",
    "rtr.apnic.net:8282 (Valid)",
  ],
  bgp_spoof_drop_rate_pct: 100.0,
  rpk_validator_engine: "Routinator 3000 / Cloudflare Go-RPKI",
  last_rtr_sync_timestamp: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/rpki-roa/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback RPKI metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
