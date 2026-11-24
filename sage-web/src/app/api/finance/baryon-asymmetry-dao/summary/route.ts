import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/baryon-asymmetry-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Baryon Asymmetry DAO summary:", err);
    return NextResponse.json({
      dao_id: "BAID-PRIMORDIAL-LEPTOGENESIS-01",
      baryon_to_photon_ratio_eta_b: 6.1e-10,
      tensor_to_scalar_ratio_r: 0.028,
      inflationary_energy_scale_gev: 1.0e16,
      sakharov_conditions_verified: true,
      electroweak_sphaleron_rate_per_sec: 3.4e21,
      total_staked_inflationary_capital_quadrillion_usd: 620.0,
      projected_annualized_yield_percent: 24.8,
      status: "COSMIC_LEPTOGENESIS_DAO_OPTIMAL",
      active_baryogenesis_vaults: 4,
    });
  }
}
