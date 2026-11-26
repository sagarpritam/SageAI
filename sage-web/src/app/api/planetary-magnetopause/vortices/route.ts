import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/planetary-magnetopause/vortices`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Planetary Magnetopause vortices:", err);
    return NextResponse.json({
      vortices: [
        {
          vortex_id: "MAGNETOPAUSE-KH-DAWN-01",
          standoff_distance_re: "10.5–13.0 R_E",
          shear_velocity_kms: 420.0,
          vortex_flux_mw: 10840.0,
          nominal_baseload_gw: 3.84,
          kh_coupling_efficiency_pct: 99.3,
          vortex_state: "MAGNETOPAUSE_KH_LOCKED",
        },
        {
          vortex_id: "MAGNETOPAUSE-KH-DUSK-02",
          standoff_distance_re: "10.8–13.5 R_E",
          shear_velocity_kms: 445.0,
          vortex_flux_mw: 11260.0,
          nominal_baseload_gw: 3.62,
          kh_coupling_efficiency_pct: 99.4,
          vortex_state: "MAGNETOPAUSE_KH_LOCKED",
        },
        {
          vortex_id: "MAGNETOPAUSE-BOWSHOCK-03",
          standoff_distance_re: "13.5–16.0 R_E",
          shear_velocity_kms: 510.0,
          vortex_flux_mw: 10200.0,
          nominal_baseload_gw: 3.38,
          kh_coupling_efficiency_pct: 99.2,
          vortex_state: "MAGNETOPAUSE_KH_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
