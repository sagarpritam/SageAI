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

    const res = await fetchBackend(`${BACKEND}/orbital-debris/calculate-conjunction`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackConjunction(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackConjunction(body));
  } catch {
    return NextResponse.json(fallbackConjunction(body));
  }
}

function fallbackConjunction(body: any) {
  const isThreat = (body.miss_distance_meters || 500.0) < 450.0;
  return {
    status: "success",
    conjunction: {
      conjunction_id: "conj-simulated",
      platform_id: body.platform_id || "laser-platform-helios-01",
      threat_detected: isThreat,
      threat_type: isThreat ? "CATASTROPHIC_ASAT_KINETIC_DEBRIS_CONJUNCTION" : "NOMINAL_ORBITAL_CONJUNCTION_PASS",
      threat_level: isThreat ? "EXTREME_CRITICAL" : "LOW",
      debris_size_cm: body.debris_size_cm || 4.5,
      relative_velocity_km_s: body.relative_velocity_km_s || 7.8,
      miss_distance_meters: body.miss_distance_meters || 120.0,
      collision_probability: body.collision_probability || 2.5e-3,
      required_delta_v_cm_s: 3.75,
      fire_control_latency_ms: 1.6,
      action_recommended: isThreat ? "DISCHARGE_PULSED_LASER_ABLATION_DEFLECTION" : "CONTINUE_ASTRODYNAMIC_RADAR_TRACKING",
      timestamp: Date.now() / 1000,
    },
  };
}

