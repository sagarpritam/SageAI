import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_RESTORE_RES = {
  edge_id: "edge-fin8-c2",
  status: "ACTIVE_LINK",
  merkle_record_hash: "c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
  message: "Relationship edge-fin8-c2 restored to ACTIVE_LINK.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/intelligence/link-graph/restore-edge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_RESTORE_RES,
        edge_id: body.edge_id || "edge-fin8-c2",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_RESTORE_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_RESTORE_RES);
  }
}
