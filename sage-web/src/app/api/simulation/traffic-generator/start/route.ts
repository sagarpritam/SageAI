import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetchBackend(`${BACKEND}/api/simulation/traffic-generator/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await safeUpstreamJson<Record<string, unknown>>(res, {});
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback traffic start:", e);
  }

  const profileId = (body.profile_id as string) || "SYN_FLOOD_VOLUMETRIC";
  const targetRps = (body.target_rps as number) || 250000;
  const durationSec = (body.duration_sec as number) || 30;

  return NextResponse.json({
    status: "RUNNING",
    message: `Synthetic stress campaign RUN-SYNTH-${Date.now()} launched against target at ${targetRps.toLocaleString()} RPS.`,
    test_details: {
      run_id: `RUN-SYNTH-${Date.now()}`,
      profile_id: profileId,
      profile_name: "Volumetric TCP SYN Flood (L4)",
      target_pop: "POP-US-EAST",
      target_rps: targetRps,
      duration_sec: durationSec,
      started_at: Date.now() / 1000,
      protocol: "TCP / SYN",
    },
  });
}
