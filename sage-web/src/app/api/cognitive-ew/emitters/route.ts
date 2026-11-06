import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/cognitive-ew/emitters`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackEmitters());
  } catch {
    return NextResponse.json(getFallbackEmitters());
  }
}

function getFallbackEmitters() {
  return {
    status: "success",
    emitters: [
      {
        emitter_id: "emitter-aesa-xband-01",
        name: "Hostile Multi-Function Fire-Control AESA Radar (X-Band)",
        frequency_ghz: 9.85,
        rf_band: "X_BAND (8.5 - 10.68 GHz)",
        radar_type: "Active Electronically Scanned Array (AESA)",
        pri_mode: "AGILE_STAGGERED_PRI",
        pulse_width_us: 12.5,
        peak_power_kw: 25.0,
        current_track_state: "LOCK_ON_TRACKING",
        threat_priority: "CRITICAL",
        jamming_attempts: 0,
      },
      {
        emitter_id: "emitter-pesa-sband-02",
        name: "Long-Range Air Defense Surveillance PESA (S-Band)",
        frequency_ghz: 3.25,
        rf_band: "S_BAND (2.0 - 4.0 GHz)",
        radar_type: "Passive Electronically Scanned Array (PESA)",
        pri_mode: "CONSTANT_PRI",
        pulse_width_us: 45.0,
        peak_power_kw: 120.0,
        current_track_state: "VOLUME_SEARCH",
        threat_priority: "ELEVATED",
        jamming_attempts: 0,
      },
      {
        emitter_id: "emitter-millimeter-kuband-03",
        name: "Active Radar Homing Missile Seeker (Ku-Band)",
        frequency_ghz: 16.4,
        rf_band: "KU_BAND (12.0 - 18.0 GHz)",
        radar_type: "Millimeter-Wave Active Radar Seeker",
        pri_mode: "HIGH_PRF_PULSE_DOPPLER",
        pulse_width_us: 2.2,
        peak_power_kw: 8.5,
        current_track_state: "TERMINAL_HOMING_GUIDANCE",
        threat_priority: "IMMINENT_LETHAL",
        jamming_attempts: 0,
      },
    ],
  };
}
