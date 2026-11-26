import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-magnetotail/lobes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Magnetotail lobes:", err);
    return NextResponse.json({
      lobes: [
        {
          lobe_id: "MAGNETOTAIL-XLINE-01",
          tail_distance_re: "22.0–35.0 R_E",
          reconnection_rate_mv_m: 4.85,
          plasmoid_flux_mw: 10580.0,
          nominal_baseload_gw: 3.76,
          reconnection_efficiency_pct: 99.2,
          plasmoid_state: "MAGNETOTAIL_PLASMOID_LOCKED",
        },
        {
          lobe_id: "MAGNETOTAIL-NEUTRAL-SHEET-02",
          tail_distance_re: "35.0–60.0 R_E",
          reconnection_rate_mv_m: 5.2,
          plasmoid_flux_mw: 11120.0,
          nominal_baseload_gw: 3.48,
          reconnection_efficiency_pct: 99.4,
          plasmoid_state: "MAGNETOTAIL_PLASMOID_LOCKED",
        },
        {
          lobe_id: "MAGNETOTAIL-DEEP-TAIL-03",
          tail_distance_re: "60.0–120.0 R_E",
          reconnection_rate_mv_m: 4.4,
          plasmoid_flux_mw: 9840.0,
          nominal_baseload_gw: 3.34,
          reconnection_efficiency_pct: 99.1,
          plasmoid_state: "MAGNETOTAIL_PLASMOID_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
