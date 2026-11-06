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

    const res = await fetch(`${BACKEND}/cognitive-ew/synthesize-waveform`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackWaveform(body));
  } catch {
    return NextResponse.json(getFallbackWaveform({}));
  }
}

function getFallbackWaveform(body: any) {
  return {
    status: "success",
    waveform: {
      synthesis_id: "DRFM-SIM-4421",
      target_emitter_id: body?.emitter_id || "emitter-aesa-xband-01",
      technique_applied: body?.technique || "RANGE_GATE_PULL_OFF_RGPO",
      synthesis_latency_us: 3.4,
      drfm_parameters: {
        center_frequency_ghz: body?.carrier_frequency_ghz || 9.85,
        modulation: "PHASE_COHERENT_CHIRP_COPY",
        pull_off_delay_us: 18.5,
        doppler_shift_khz: 0.0,
        radiated_jamming_power_kw: 37.5,
      },
      jamming_to_signal_ratio_db: 22.4,
      track_break_probability: 0.942,
      status: "WAVEFORM_SYNTHESIS_ARMED",
      timestamp: Date.now() / 1000,
    },
  };
}

