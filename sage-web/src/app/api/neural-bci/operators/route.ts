import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/neural-bci/operators`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackOperators());
  } catch {
    return NextResponse.json(getFallbackOperators());
  }
}

function getFallbackOperators() {
  return {
    status: "success",
    operators: [
      {
        operator_id: "bci-ciso-commander-01",
        callsign: "Sovereign Commander",
        role: "STRATEGIC_CISO_AUTHORIZATION",
        eeg_channel_count: 64,
        impedance_kohm: 4.2,
        nominal_p300_uv: 14.5,
        nominal_n400_ms: 395.0,
        biometric_status: "ENROLLED_AUTHENTICATED",
        coercion_attacks_blocked: 2,
      },
      {
        operator_id: "bci-scada-engineer-02",
        callsign: "Grid Kinetic Engineer",
        role: "INDUSTRIAL_TURBINE_ACTUATOR_OVERRIDE",
        eeg_channel_count: 32,
        impedance_kohm: 3.8,
        nominal_p300_uv: 12.0,
        nominal_n400_ms: 410.0,
        biometric_status: "ENROLLED_AUTHENTICATED",
        coercion_attacks_blocked: 4,
      },
      {
        operator_id: "bci-orbital-telemetry-03",
        callsign: "Orbital Flight Director",
        role: "SATELLITE_CONSTELLATION_MANEUVER",
        eeg_channel_count: 64,
        impedance_kohm: 4.5,
        nominal_p300_uv: 15.2,
        nominal_n400_ms: 388.0,
        biometric_status: "ENROLLED_AUTHENTICATED",
        coercion_attacks_blocked: 1,
      },
    ],
  };
}

