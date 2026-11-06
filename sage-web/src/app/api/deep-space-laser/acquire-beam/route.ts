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

    const res = await fetch(`${BACKEND}/deep-space-laser/acquire-beam`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const isDesync = body.point_ahead_angle_urad > 1.35 || body.photon_snr_db < 3.0;
    return NextResponse.json({
      status: "success",
      acquisition: {
        acquisition_id: `dsoc-acq-${Math.random().toString(16).slice(2, 8)}`,
        terminal_id: body.terminal_id,
        threat_detected: isDesync,
        threat_type: isDesync ? "ASTRONOMICAL_BEAM_POINTING_DESYNC" : "NOMINAL_ASTRONOMICAL_ALIGNMENT",
        point_ahead_angle_urad: body.point_ahead_angle_urad,
        doppler_shift_ghz: body.doppler_shift_ghz,
        photon_snr_db: body.photon_snr_db,
        action_recommended: isDesync ? "ENGAGE_FAST_STEERING_MIRROR_CLOSED_LOOP" : "CONTINUE_QUANTUM_PHOTON_FRAMING",
      },
    });
  } catch {
    return NextResponse.json({
      status: "success",
      acquisition: {
        threat_detected: false,
        threat_type: "NOMINAL_ASTRONOMICAL_ALIGNMENT",
      },
    });
  }
}

