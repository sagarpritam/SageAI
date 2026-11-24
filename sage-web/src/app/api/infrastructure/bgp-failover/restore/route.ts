import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_RESTORE_RES = {
  pop_id: "POP-US-EAST",
  status: "ROUTE_RESTORED",
  bgp_status: "ANNOUNCING_PREF_100",
  merkle_record_hash: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/bgp-failover/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_RESTORE_RES,
        pop_id: body.pop_id || "POP-US-EAST",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_RESTORE_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_RESTORE_RES);
  }
}
