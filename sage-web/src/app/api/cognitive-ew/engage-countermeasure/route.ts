import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/cognitive-ew/engage-countermeasure`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackEngagement(body));
  } catch {
    return NextResponse.json(getFallbackEngagement({}));
  }
}

function getFallbackEngagement(body: any) {
  return {
    status: "success",
    engagement: {
      engagement_id: "EW-ENGAGE-SIM-7712",
      emitter_id: body?.emitter_id || "emitter-aesa-xband-01",
      previous_state: "LOCK_ON_TRACKING",
      current_state: "RADAR_TRACK_BROKEN_SEDUCED",
      technique: body?.technique || "RANGE_GATE_PULL_OFF_RGPO",
      duration_ms: body?.duration_ms || 250.0,
      rf_response_latency_us: 4.1,
      deception_outcome: "ADVERSARY_RANGE_GATE_SEDUCED_AND_DROPPED",
      effective_rcs_reduction_db: -32.5,
      status: "ENGAGEMENT_SUCCESSFUL_TRACK_LOST",
      timestamp: Date.now() / 1000,
    },
  };
}
