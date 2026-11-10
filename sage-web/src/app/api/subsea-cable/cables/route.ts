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

    const res = await fetchBackend(`${BACKEND}/subsea-cable/cables`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackCables());
  } catch {
    return NextResponse.json(getFallbackCables());
  }
}

function getFallbackCables() {
  return {
    status: "success",
    cables: [
      {
        cable_id: "cable-transatlantic-ta01",
        name: "Transatlantic Sovereign Core Trunk (TA-01)",
        route: "Bude (UK) <-> Halifax (Canada)",
        length_km: 6200.0,
        fiber_pairs: 16,
        capacity_tbps: 320.0,
        otdr_attenuation_db_km: 0.165,
        sop_rotation_rad_s: 4.2,
        das_acoustic_noise_db: -55.0,
        status: "MONITORED_SECURE",
        physical_taps_intercepted: 3,
        redundant_fallback_route: "cable-arctic-polar03",
      },
      {
        cable_id: "cable-transpacific-tp02",
        name: "Transpacific Sovereign Fiber Trunk (TP-02)",
        route: "Tokyo (Japan) <-> Oregon (USA)",
        length_km: 9400.0,
        fiber_pairs: 24,
        capacity_tbps: 480.0,
        otdr_attenuation_db_km: 0.170,
        sop_rotation_rad_s: 5.1,
        das_acoustic_noise_db: -52.0,
        status: "MONITORED_SECURE",
        physical_taps_intercepted: 5,
        redundant_fallback_route: "cable-transatlantic-ta01",
      },
      {
        cable_id: "cable-arctic-polar03",
        name: "High-Arctic Sovereign Optical Bypass (Polar-03)",
        route: "Tromsø (Norway) <-> Anchorage (Alaska)",
        length_km: 7100.0,
        fiber_pairs: 12,
        capacity_tbps: 200.0,
        otdr_attenuation_db_km: 0.160,
        sop_rotation_rad_s: 2.8,
        das_acoustic_noise_db: -60.0,
        status: "MONITORED_SECURE",
        physical_taps_intercepted: 1,
        redundant_fallback_route: "cable-transpacific-tp02",
      },
    ],
  };
}

