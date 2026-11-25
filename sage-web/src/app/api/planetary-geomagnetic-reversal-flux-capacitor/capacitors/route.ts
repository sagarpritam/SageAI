import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-geomagnetic-reversal-flux-capacitor/capacitors`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { capacitors: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      capacitors: [
        {
          capacitor_id: "GEOMAG-SOUTH-ATLANTIC-ANOMALY-01",
          name: "South Atlantic Anomaly Reversed-Flux Patch Capacitor 01",
          gauss_harmonic_mode: "g_1^0 + g_2^0 + g_3^0 Multipole",
          multipole_order: 3,
          magnetic_flux_density_ut: 22.4,
          nominal_capacity_gw: 8.200,
          secular_flux_mw: 712.5,
          geomagnetic_capacitor_state: "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
          lorentz_coupling_efficiency_pct: 97.0,
        },
        {
          capacitor_id: "GEOMAG-POLAR-CUSP-MULTIPOLE-02",
          name: "Arctic-Antarctic Polar Cusp Induction Toroid 02",
          gauss_harmonic_mode: "g_1^0 Axial Dipole + Birkeland Loop",
          multipole_order: 1,
          magnetic_flux_density_ut: 64.8,
          nominal_capacity_gw: 5.400,
          secular_flux_mw: 468.2,
          geomagnetic_capacitor_state: "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
          lorentz_coupling_efficiency_pct: 96.5,
        },
        {
          capacitor_id: "GEOMAG-EXCURSION-FLUX-CAPACITOR-03",
          name: "Laschamp-Style Excursion Multipole Ring 03",
          gauss_harmonic_mode: "Octupole-Hexadecapole Transition",
          multipole_order: 4,
          magnetic_flux_density_ut: 38.2,
          nominal_capacity_gw: 7.600,
          secular_flux_mw: 655.8,
          geomagnetic_capacitor_state: "MULTIPOLE_FLUX_CAPACITOR_LOCKED",
          lorentz_coupling_efficiency_pct: 97.5,
        },
      ],
    },
    { status: 200 }
  );
}
