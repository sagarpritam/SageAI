import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/pbh-cluster-merger/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback PBH Cluster Merger summary:", err);
    return NextResponse.json({
      dao_id: "PBHM-CLUSTER-MERGER-01",
      cluster_number_density_pc3: 1.5e4,
      qcd_transition_horizon_mass_msun: 1.0,
      sub_solar_mass_fraction_fpbh: 0.08,
      merger_rate_per_gpc3_yr: 4.2e3,
      total_staked_merger_capital_quadrillion_usd: 850.0,
      projected_annualized_yield_percent: 32.5,
      status: "PBH_MERGER_CLUSTER_YIELD_OPTIMAL",
      active_merger_vaults: 4,
    });
  }
}
