import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/baryon-asymmetry-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Baryon Asymmetry DAO vaults:", err);
    return NextResponse.json([
      {
        vault_id: "BAID-VAULT-THERMAL-LEPTOGENESIS",
        mechanism: "HEAVY_RIGHT_HANDED_MAJORANA_DECAY",
        mass_scale_gev: 1.0e10,
        cp_violation_epsilon: 1.2e-6,
        staked_capital_quadrillion_usd: 185.0,
        apy_percent: 24.2,
        status: "OUT_OF_EQUILIBRIUM_DECAY_ACCRETING",
      },
      {
        vault_id: "BAID-VAULT-AFFLECK-DINE-CONDENSATE",
        mechanism: "SUPERSYMMETRIC_FLAT_DIRECTION_CONDENSATE",
        mass_scale_gev: 1.0e14,
        cp_violation_epsilon: 4.5e-5,
        staked_capital_quadrillion_usd: 155.0,
        apy_percent: 25.6,
        status: "B_BALL_COHERENT_OSCILLATION_ACCRETING",
      },
      {
        vault_id: "BAID-VAULT-ELECTROWEAK-SPHALERON",
        mechanism: "CHIRAL_ANOMALY_B_PLUS_L_VIOLATION",
        mass_scale_gev: 2.4e2,
        cp_violation_epsilon: 8.9e-7,
        staked_capital_quadrillion_usd: 140.0,
        apy_percent: 23.8,
        status: "SPHALERON_TRANSITION_HARVESTING",
      },
      {
        vault_id: "BAID-VAULT-AXION-INFLATON-COUPLING",
        mechanism: "CHERN_SIMONS_FERMION_PRODUCTION",
        mass_scale_gev: 1.0e16,
        cp_violation_epsilon: 2.1e-4,
        staked_capital_quadrillion_usd: 140.0,
        apy_percent: 25.8,
        status: "PARITY_VIOLATING_GAUGE_EXCITATION",
      },
    ]);
  }
}
