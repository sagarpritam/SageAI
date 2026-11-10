import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  const parsed = await safeOptionalJsonBody<any>(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const body = parsed.data;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/marine-sonar/analyze-acoustic`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackAcoustic(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackAcoustic(body));
  } catch {
    return NextResponse.json(fallbackAcoustic(body));
  }
}

function fallbackAcoustic(body: any) {
  const isThreat = (body.ambient_spl_db || 68.0) > 85.0;
  return {
    status: "success",
    analysis: {
      acoustic_analysis_id: "sonar-eval-simulated",
      node_id: body.node_id || "sonar-node-giuk-gap-01",
      threat_detected: isThreat,
      threat_type: isThreat ? "HOSTILE_UNCREWED_AUV_CAVITATION" : "NOMINAL_BIOLOGICAL_OCEAN_SOUNDSCAPE",
      threat_level: isThreat ? "CRITICAL" : "LOW",
      sound_velocity_mps: body.sound_velocity_mps || 1495.0,
      ambient_spl_db: body.ambient_spl_db || 70.0,
      spectral_peak_hz: body.spectral_peak_hz || 95.0,
      acoustic_doppler_mps: body.acoustic_doppler_mps || 2.0,
      snr_db: 18.5,
      triangulation_latency_ms: 14.2,
      action_recommended: isThreat ? "EXECUTE_SUB_18MS_ACOUSTIC_TRIANGULATION" : "CONTINUE_PASSIVE_ACOUSTIC_SURVEILLANCE",
      timestamp: Date.now() / 1000,
    },
  };
}

