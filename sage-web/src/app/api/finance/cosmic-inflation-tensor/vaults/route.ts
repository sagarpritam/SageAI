import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-inflation-tensor/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Cosmic Inflation Tensor vaults:", err);
    return NextResponse.json([
      {
        vault_id: "CITM-VAULT-PRIMORDIAL-INFLATON",
        polarization_signature: "CMB_QUADRUPOLE_RECOMBINATION_PEAK",
        multipole_moment_l: 80,
        tensor_amplitude_uk2: 0.045,
        staked_capital_quadrillion_usd: 210.0,
        apy_percent: 28.5,
        status: "PRIMORDIAL_GW_YIELD_HARVESTING",
      },
      {
        vault_id: "CITM-VAULT-LENSING-CLEANSED",
        polarization_signature: "DELENSED_GRAVITATIONAL_CMB_MAP",
        multipole_moment_l: 500,
        tensor_amplitude_uk2: 0.012,
        staked_capital_quadrillion_usd: 185.0,
        apy_percent: 27.8,
        status: "E_TO_B_DEROTATION_ACTIVE",
      },
      {
        vault_id: "CITM-VAULT-REIONIZATION-BUMP",
        polarization_signature: "LARGE_ANGULAR_OPTICAL_DEPTH_TAU",
        multipole_moment_l: 6,
        tensor_amplitude_uk2: 0.088,
        staked_capital_quadrillion_usd: 160.0,
        apy_percent: 28.2,
        status: "OPTICAL_DEPTH_ACCRETING",
      },
      {
        vault_id: "CITM-VAULT-SPECTRAL-RUNNING",
        polarization_signature: "SECOND_ORDER_SLOW_ROLL_PARAM_XI",
        multipole_moment_l: 120,
        tensor_amplitude_uk2: 0.031,
        staked_capital_quadrillion_usd: 145.0,
        apy_percent: 27.5,
        status: "INFLATON_POTENTIAL_ACCRETING",
      },
    ]);
  }
}
