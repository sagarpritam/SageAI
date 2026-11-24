import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/quantum-spin-liquid/ribbons", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Quantum Spin Liquid ribbons:", err);
    return NextResponse.json([
      {
        ribbon_id: "QSLB-RIBBON-KITAEV-ALPHA",
        material_phase: "ALPHA_RUCL3_HONEYCOMB",
        majorana_velocity_km_s: 380.0,
        flux_vortices_count: 16,
        chiral_edge_width_nm: 4.5,
        status: "FRACTIONALIZED_CHIRAL_LOCKED",
      },
      {
        ribbon_id: "QSLB-RIBBON-Z2-VISON-BETA",
        material_phase: "NA2IRO3_HEAVY_ELEMENT",
        majorana_velocity_km_s: 410.0,
        flux_vortices_count: 24,
        chiral_edge_width_nm: 5.2,
        status: "Z2_GAUGE_FLUX_PINNED",
      },
      {
        ribbon_id: "QSLB-RIBBON-CHIRAL-EDGE-GAMMA",
        material_phase: "TORIC_CODE_ANALOG_2D",
        majorana_velocity_km_s: 450.0,
        flux_vortices_count: 32,
        chiral_edge_width_nm: 3.8,
        status: "THERMAL_HALL_HALF_QUANTIZED",
      },
      {
        ribbon_id: "QSLB-RIBBON-TORIC-DELTA",
        material_phase: "H3LIIRO6_INTERCALATED",
        majorana_velocity_km_s: 360.0,
        flux_vortices_count: 12,
        chiral_edge_width_nm: 6.0,
        status: "SPIN_LIQUID_PROTECTED",
      },
    ]);
  }
}
