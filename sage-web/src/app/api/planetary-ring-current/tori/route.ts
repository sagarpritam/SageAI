import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-ring-current/tori`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Ring Current tori:", err);
  }

  return NextResponse.json({
    tori: [
      {
        torus_id: "RING-CURRENT-TORUS-01",
        name: "Equatorial Ring-Current Ion-Drift Torus (L=3.5)",
        l_shell: 3.5,
        alfven_speed_kms: 980.0,
        nominal_baseload_gw: 3.7,
        alfven_efficiency_pct: 99.1,
        status: "RING_CURRENT_ALFVEN_LOCKED",
      },
      {
        torus_id: "PLASMAPAUSE-ALFVEN-MASER-02",
        name: "Plasmapause Alfven Standing Waveguide Maser (L=4.8)",
        l_shell: 4.8,
        alfven_speed_kms: 1240.0,
        nominal_baseload_gw: 3.9,
        alfven_efficiency_pct: 99.4,
        status: "RING_CURRENT_ALFVEN_LOCKED",
      },
      {
        torus_id: "SUBSTORM-DIPOLARIZATION-03",
        name: "Substorm Dipolarization Wedge Inductive Ring (L=6.6)",
        l_shell: 6.6,
        alfven_speed_kms: 1520.0,
        nominal_baseload_gw: 2.72,
        alfven_efficiency_pct: 98.9,
        status: "RING_CURRENT_ALFVEN_LOCKED",
      },
    ],
  });
}
