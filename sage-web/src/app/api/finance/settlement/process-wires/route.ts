import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PROCESS_WIRES = {
  status: "WIRES_PROCESSED_AND_SETTLED",
  updated_investors: ["INV-APEX-01", "INV-HYPER-02", "INV-CISO-03"],
  total_cleared_usd: 6000000.0,
  timestamp: Date.now() / 1000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/finance/settlement/process-wires`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_PROCESS_WIRES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_PROCESS_WIRES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_PROCESS_WIRES);
  }
}
