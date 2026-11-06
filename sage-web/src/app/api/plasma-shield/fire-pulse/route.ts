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

    const res = await fetch(`${BACKEND}/plasma-shield/fire-pulse`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackFire(body));
  } catch {
    return NextResponse.json(getFallbackFire({}));
  }
}

function getFallbackFire(body: any) {
  const energy = body?.pulse_energy_mj || 120.0;
  const dv = Math.round(energy * 0.42 * 100) / 100;

  return {
    status: "success",
    deflection_event: {
      deflection_event_id: "PLASMA-FIRE-SIM-1845",
      platform_id: body?.platform_id || "plasma-shield-aegis-orbital-01",
      target_threat_id: body?.target_threat_id || "HOSTILE-KKV-SIM-01",
      discharge_speed_ms: 6.4,
      pulse_energy_mj: energy,
      beam_cross_section_cm: body?.beam_diameter_cm || 15.0,
      recoil_delta_v_m_s: dv,
      new_miss_distance_km: Math.round(dv * 1.85 * 100) / 100,
      kinetic_kill_neutralized: true,
      outcome: "HYPERVELOCITY_KKV_DEFLECTED_AND_ABLATED",
      timestamp: Date.now() / 1000,
    },
  };
}
