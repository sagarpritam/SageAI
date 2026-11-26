import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(
      `${FASTAPI_BASE}/api/planetary-oceanic-thermohaline/currents`,
      { cache: "no-store" }
    );
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Oceanic Thermohaline currents:", err);
  }

  return NextResponse.json({
    currents: [
      {
        current_id: "AMOC-NORTH-ATLANTIC-DEEPWATER-01",
        name: "North Atlantic Deep Water AMOC Thermohaline Array",
        sverdrup_transport_sv: 18.5,
        depth_m: 3800.0,
        salinity_psu: 34.92,
        nominal_baseload_gw: 3.4,
        lorentz_efficiency_pct: 98.4,
        status: "THERMOHALINE_CORIOLIS_LOCKED",
      },
      {
        current_id: "ANTARCTIC-CIRCUMPOLAR-ABYSSAL-02",
        name: "Antarctic Circumpolar Abyssal Coriolis Induction Ring",
        sverdrup_transport_sv: 134.0,
        depth_m: 4400.0,
        salinity_psu: 34.72,
        nominal_baseload_gw: 3.8,
        lorentz_efficiency_pct: 98.8,
        status: "THERMOHALINE_CORIOLIS_LOCKED",
      },
      {
        current_id: "KUROSHIO-WESTERN-BOUNDARY-03",
        name: "Kuroshio Western Boundary Magnetohydrodynamic Loop",
        sverdrup_transport_sv: 42.0,
        depth_m: 2600.0,
        salinity_psu: 34.65,
        nominal_baseload_gw: 2.4,
        lorentz_efficiency_pct: 98.1,
        status: "THERMOHALINE_CORIOLIS_LOCKED",
      },
    ],
  });
}
