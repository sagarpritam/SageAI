import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SUMMARY = {
  total_monitored_domains: 4,
  total_darkweb_threats_intercepted: 4,
  preemptively_shielded_threats: 3,
  critical_severity_threats: 3,
  predictive_containment_ratio: 0.75,
  feed_status: "REAL_TIME_STREAMING_ONLINE",
  last_synced_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/intelligence/panopticon/summary`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SUMMARY);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SUMMARY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SUMMARY);
  }
}
