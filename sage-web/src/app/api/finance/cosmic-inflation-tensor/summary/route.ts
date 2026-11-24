import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-inflation-tensor/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Inflation Tensor summary:", err);
    return NextResponse.json({
      dao_id: "CITM-PRIMORDIAL-B-MODE-01",
      tensor_to_scalar_ratio_r: 0.024,
      tensor_spectral_index_n_t: -0.003,
      energy_scale_inflation_gev: 1.2e16,
      b_mode_lensing_subtraction_db: -32.5,
      total_staked_polarization_capital_quadrillion_usd: 700.0,
      projected_annualized_yield_percent: 28.0,
      status: "PRIMORDIAL_GRAVITATIONAL_DAO_OPTIMAL",
      active_polarization_vaults: 4,
    });
  }
}
