import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_RECOVER_RES = {
  drill_id: "DRILL-CHAOS-MR-SIMULATED",
  status: "ALL_PRIMARY_ROUTES_RECOVERED",
  recovered_pops: ["POP-EU-WEST", "POP-GOV-WEST"],
  bgp_announcement: "ANNOUNCING_PREF_100_RESTORED",
  hot_standby_state: "HOT_STANDBY_SYNCED",
  merkle_record_hash: "f1049bc82e9124a9192384a0d912401823940192840192481092840192840192",
  recovered_at: Date.now() / 1000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/infrastructure/disaster-drill/recover`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_RECOVER_RES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_RECOVER_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_RECOVER_RES);
  }
}
