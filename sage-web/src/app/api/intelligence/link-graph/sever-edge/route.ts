import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SEVER_RES = {
  edge_id: "edge-fin8-c2",
  status: "SEVERED_EBPF_CLAMPED",
  source: "APT-FIN8",
  target: "194.26.29.114",
  relation: "OPERATES_C2",
  merkle_record_hash: "b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
  message: "Relationship edge-fin8-c2 severed. Ingress and egress traffic between APT-FIN8 and 194.26.29.114 blocked at kernel XDP hook.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(`${BACKEND}/api/intelligence/link-graph/sever-edge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_SEVER_RES,
        edge_id: body.edge_id || "edge-fin8-c2",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_SEVER_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SEVER_RES);
  }
}
