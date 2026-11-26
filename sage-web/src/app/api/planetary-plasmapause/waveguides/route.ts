import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-plasmapause/waveguides`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Plasmapause waveguides:", err);
    return NextResponse.json({
      waveguides: [
        {
          waveguide_id: "PLASMAPAUSE-CHORUS-01",
          l_shell_boundary: "L = 4.2–5.5",
          whistler_freq_khz: 3.8,
          chorus_flux_mw: 11960.0,
          nominal_baseload_gw: 4.24,
          waveguide_efficiency_pct: 99.6,
          waveguide_state: "PLASMAPAUSE_WHISTLER_LOCKED",
        },
        {
          waveguide_id: "PLASMAPAUSE-HISS-02",
          l_shell_boundary: "L = 2.8–4.2",
          whistler_freq_khz: 1.4,
          chorus_flux_mw: 11680.0,
          nominal_baseload_gw: 4.02,
          waveguide_efficiency_pct: 99.5,
          waveguide_state: "PLASMAPAUSE_WHISTLER_LOCKED",
        },
        {
          waveguide_id: "PLASMAPAUSE-DUCT-03",
          l_shell_boundary: "L = 5.5–6.8",
          whistler_freq_khz: 5.2,
          chorus_flux_mw: 11240.0,
          nominal_baseload_gw: 3.7,
          waveguide_efficiency_pct: 99.4,
          waveguide_state: "PLASMAPAUSE_WHISTLER_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
