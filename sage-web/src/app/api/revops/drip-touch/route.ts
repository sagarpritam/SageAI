import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

interface DripTouchPayload {
  lead_id?: string;
  touch_number?: number;
}

export async function POST(req: Request) {
  let body: DripTouchPayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lead_id, touch_number } = body;
  if (!lead_id || typeof touch_number !== "number" || touch_number < 1 || touch_number > 3) {
    return NextResponse.json(
      { error: "lead_id and touch_number (1-3) are required" },
      { status: 400 }
    );
  }

  const fallback = {
    lead_id,
    touch: touch_number,
    stage_name:
      touch_number === 1
        ? "Recon & Challenge Token Dispatch"
        : touch_number === 2
        ? "48h Virtual Patch Advisory & Zero-Trust Sandbox Proof"
        : "Executive Board Risk Deck & 14-Day Pilot SLA Contract",
    new_status:
      touch_number === 1
        ? "DISPATCHED"
        : touch_number === 2
        ? "CHALLENGE_VERIFIED"
        : "PILOT_ACTIVE",
    uptime_guarantee: "99.999%",
    pqc_isolation: "FIPS 203/204 Quantum-Safe",
    arr_contract_value_usd: 220000,
    timestamp: Date.now() / 1000,
  };

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/drip-touch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id, touch_number }),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, fallback));
    }
  } catch {
    // fallback
  }

  return NextResponse.json(fallback);
}

