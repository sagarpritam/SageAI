import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-akr-maser/cavities`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary AKR cavities:", err);
    return NextResponse.json({
      cavities: [
        {
          cavity_id: "AKR-CAVITY-BOREAL-01",
          altitude_km: "4,500–12,000 km",
          cyclotron_freq_khz: 285.0,
          akr_flux_mw: 11400.0,
          nominal_baseload_gw: 4.04,
          maser_efficiency_pct: 99.5,
          cavity_state: "AKR_MASER_LOCKED",
        },
        {
          cavity_id: "AKR-CAVITY-AUSTRAL-02",
          altitude_km: "4,800–12,500 km",
          cyclotron_freq_khz: 270.0,
          akr_flux_mw: 11180.0,
          nominal_baseload_gw: 3.82,
          maser_efficiency_pct: 99.4,
          cavity_state: "AKR_MASER_LOCKED",
        },
        {
          cavity_id: "AKR-CAVITY-ALFVEN-03",
          altitude_km: "12,500–18,000 km",
          cyclotron_freq_khz: 195.0,
          akr_flux_mw: 10640.0,
          nominal_baseload_gw: 3.54,
          maser_efficiency_pct: 99.3,
          cavity_state: "AKR_MASER_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
