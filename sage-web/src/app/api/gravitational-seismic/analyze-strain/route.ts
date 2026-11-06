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

    const res = await fetch(`${BACKEND}/gravitational-seismic/analyze-strain`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackAnalysis(body));
  } catch {
    return NextResponse.json(getFallbackAnalysis({}));
  }
}

function getFallbackAnalysis(body: any) {
  const strain = body?.measured_strain_h || 2.5e-20;
  const isShock = strain > 1e-19;
  const isBoring = strain >= 1e-20 && !isShock;

  return {
    status: "success",
    analysis: {
      analysis_id: "STRAIN-SIM-8419",
      observatory_id: body?.observatory_id || "gw-obs-kagra-subterra-01",
      measured_strain_h: strain,
      differential_displacement_fm: strain * 3.0 * 1e18,
      dominant_frequency_hz: body?.dominant_frequency_hz || 28.0,
      p_s_wave_ratio: 1.77,
      threat_type: isShock
        ? "SUBCRUSTAL_PROMPT_NUCLEAR_DETONATION"
        : isBoring
        ? "COVERT_DEEP_TUNNEL_BORING_MACHINE"
        : "NATURAL_TECTONIC_MICROSEISM",
      threat_level: isShock
        ? "CRITICAL_PLANETARY_SHOCK"
        : isBoring
        ? "ELEVATED_COVERT_EXCAVATION"
        : "NOMINAL_BACKGROUND",
      estimated_yield_kilotons: isShock ? 24.5 : 0.0,
      action_recommended: isShock
        ? "TRIGGER_GLOBAL_SEISMIC_ALERT_AND_INFER_YIELD"
        : isBoring
        ? "COMMENCE_SUBTERRANEAN_TDOA_LOCALIZATION"
        : "CONTINUE_SUBTERRANEAN_MONITORING",
      timestamp: Date.now() / 1000,
    },
  };
}
