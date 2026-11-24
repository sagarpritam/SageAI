import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-reionization-21cm/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Reionization 21cm vaults:", err);
    return NextResponse.json([
      {
        vault_id: "CR21-VAULT-WOUTHUYSEN-FIELD",
        astrophysical_regime: "LYMAN_ALPHA_RADIATIVE_COUPLING",
        redshift_slice_z: 15.5,
        brightness_temp_mk: -185.0,
        staked_capital_quadrillion_usd: 195.0,
        apy_percent: 26.8,
        status: "SPIN_EXCHANGE_PUMPING_ACCRETING",
      },
      {
        vault_id: "CR21-VAULT-LYMAN-ALPHA-BACKGROUND",
        astrophysical_regime: "POP_III_STELLAR_EMISSION_LINE",
        redshift_slice_z: 12.0,
        brightness_temp_mk: -145.0,
        staked_capital_quadrillion_usd: 175.0,
        apy_percent: 27.2,
        status: "IONIZATION_FRONT_ADVANCING",
      },
      {
        vault_id: "CR21-VAULT-BUBBLE-PERCOLATION-UV",
        astrophysical_regime: "HII_STRÖMGREN_SPHERE_MERGER",
        redshift_slice_z: 8.5,
        brightness_temp_mk: -90.0,
        staked_capital_quadrillion_usd: 150.0,
        apy_percent: 25.5,
        status: "TOPOLOGICAL_PERCOLATION_HARVESTING",
      },
      {
        vault_id: "CR21-VAULT-SPIN-TEMP-COOLING",
        astrophysical_regime: "ADIABATIC_HUBBLE_EXPANSION_GAS",
        redshift_slice_z: 18.0,
        brightness_temp_mk: -220.0,
        staked_capital_quadrillion_usd: 140.0,
        apy_percent: 26.1,
        status: "COLD_IGM_DEEP_ABSORPTION_ACCRETING",
      },
    ]);
  }
}
