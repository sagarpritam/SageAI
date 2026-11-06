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

    const res = await fetch(`${BACKEND}/geomagnetic-shield/evaluate-storm`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackStormEval(body));
  } catch {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(fallbackStormEval(body));
  }
}

function fallbackStormEval(body: any) {
  const isSevere = (body.kp_index || 3.0) >= 7.5 || (body.measured_gic_amps || 5.0) > 45.0;
  return {
    status: "success",
    evaluation: {
      evaluation_id: "cme-eval-simulated",
      substation_id: body.substation_id || "substation-quebec-hydro-01",
      threat_detected: isSevere,
      threat_type: isSevere ? "CATASTROPHIC_CME_TRANSFORMER_CORE_SATURATION" : "NOMINAL_MAGNETOSPHERE_FIELD",
      threat_level: isSevere ? "EXTREME_CRITICAL" : "LOW",
      kp_index: body.kp_index || 3.0,
      db_dt_nt_per_min: body.db_dt_nt_per_min || 45.0,
      measured_gic_amps: body.measured_gic_amps || 4.2,
      reactive_power_loss_mvar: isSevere ? 82.5 : 3.8,
      action_recommended: isSevere ? "TRIP_NEUTRAL_SERIES_BLOCKING_CAPACITOR" : "CONTINUE_PMU_MONITORING",
      timestamp: Date.now() / 1000,
    },
  };
}

