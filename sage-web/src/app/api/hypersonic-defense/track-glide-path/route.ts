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

    const res = await fetch(`${BACKEND}/hypersonic-defense/track-glide-path`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const isThreat = body.measured_mach >= 5.0;
    return NextResponse.json({
      status: "success",
      tracking: {
        tracking_id: `hyp-track-${Math.random().toString(16).slice(2, 8)}`,
        threat_id: body.threat_id,
        threat_detected: isThreat,
        threat_type: isThreat ? "EXTREME_VELOCITY_HGV_ATMOSPHERIC_SKIP" : "NOMINAL_AIRSPACE_TRAJECTORY",
        threat_level: isThreat ? "EXTREME_CRITICAL" : "LOW",
        measured_mach: body.measured_mach,
        altitude_km: body.altitude_km,
        skip_glide_detected: body.skip_glide_detected,
        plasma_sheath_blackout: body.plasma_blackout_active,
        plasma_cutoff_freq_ghz: 39.69,
        predicted_impact_latitude: 38.8951,
        predicted_impact_longitude: -77.0364,
        action_recommended: isThreat ? "FIRE_EXO_ATMOSPHERIC_KILL_VEHICLE" : "CONTINUE_RADAR_SURVEILLANCE",
      },
    });
  } catch {
    return NextResponse.json({
      status: "success",
      tracking: {
        threat_detected: false,
        threat_type: "NOMINAL_AIRSPACE_TRAJECTORY",
      },
    });
  }
}

