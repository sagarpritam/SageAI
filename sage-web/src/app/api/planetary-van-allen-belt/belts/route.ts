import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/planetary-van-allen-belt/belts`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Planetary Van Allen Belt profiles:", err);
  }

  return NextResponse.json({
    belts: [
      {
        belt_id: "VAN-ALLEN-INNER-PROTON-01",
        name: "Inner Van Allen Proton Belt Betatron Ring (L=1.5)",
        l_shell: 1.5,
        energy_mev: 45.0,
        nominal_baseload_gw: 3.65,
        betatron_efficiency_pct: 99.0,
        status: "VAN_ALLEN_BETATRON_LOCKED",
      },
      {
        belt_id: "VAN-ALLEN-OUTER-CHORUS-02",
        name: "Outer Relativistic Electron Whistler-Chorus Array (L=4.2)",
        l_shell: 4.2,
        energy_mev: 5.5,
        nominal_baseload_gw: 3.85,
        betatron_efficiency_pct: 99.3,
        status: "VAN_ALLEN_BETATRON_LOCKED",
      },
      {
        belt_id: "SOUTH-ATLANTIC-FLUX-03",
        name: "South Atlantic Anomaly Trapped-Flux Concentrator",
        l_shell: 1.25,
        energy_mev: 32.0,
        nominal_baseload_gw: 2.7,
        betatron_efficiency_pct: 98.8,
        status: "VAN_ALLEN_BETATRON_LOCKED",
      },
    ],
  });
}
