import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-reionization-21cm/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Reionization 21cm summary:", err);
    return NextResponse.json({
      dao_id: "CR21-EPOCH-REIONIZATION-01",
      redshift_range_z: "6.0 - 20.0",
      spin_temperature_kelvin: 18.2,
      cmb_brightness_temp_fluctuation_mk: -150.0,
      wouthuysen_field_coupling_factor: 48.5,
      bubble_percolation_uv_fraction: 0.88,
      total_staked_cosmic_dawn_capital_quadrillion_usd: 660.0,
      projected_annualized_yield_percent: 26.4,
      status: "COSMIC_DAWN_TOMOGRAPHY_OPTIMAL",
      active_reionization_vaults: 4,
    });
  }
}
