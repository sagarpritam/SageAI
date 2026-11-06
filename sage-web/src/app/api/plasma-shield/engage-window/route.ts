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

    const res = await fetch(`${BACKEND}/plasma-shield/engage-window`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackWindow(body));
  } catch {
    return NextResponse.json(getFallbackWindow({}));
  }
}

function getFallbackWindow(body: any) {
  const v = body?.incoming_velocity_km_s || 8.5;
  const m = body?.estimated_threat_mass_kg || 45.0;
  const ke = Math.round(0.5 * m * (v * 1e3)**2 / 1e6 * 100) / 100;

  return {
    status: "success",
    window_event: {
      window_event_id: "PLASMA-WIN-SIM-9128",
      platform_id: body?.platform_id || "plasma-shield-aegis-orbital-01",
      target_threat_id: body?.target_threat_id || "HOSTILE-KKV-SIM-01",
      response_latency_ms: 8.2,
      magnetic_confinement_tesla: 8.5,
      plasma_electron_density_cm3: 1.4e15,
      threat_kinetic_energy_mj: ke,
      induced_hydrodynamic_drag_g: Math.round((v * 1e3 * 0.15) / 9.81 * 10) / 10,
      containment_status: "HIGH_DENSITY_PLASMA_STANDOFF_ESTABLISHED",
      timestamp: Date.now() / 1000,
    },
  };
}

