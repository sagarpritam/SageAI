import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/bec-dark-energy/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback BEC Dark Energy vaults:", err);
    return NextResponse.json([
      {
        vault_id: "FUZZY-AXION-SOLITON-CORE",
        condensate_phase: "Macroscopic Fuzzy Axion Core Condensate",
        healing_length_parsecs: 350.0,
        staked_capital_quadrillion_usd: 220.0,
        target_annual_yield_apy: 31.0,
        status: "SOLITON_CORE_COHERENT",
      },
      {
        vault_id: "GROSS-PITAEVSKII-SUPERFLUID",
        condensate_phase: "Gross-Pitaevskii Non-Linear Superfluid Wavefunction",
        healing_length_parsecs: 420.0,
        staked_capital_quadrillion_usd: 190.0,
        target_annual_yield_apy: 29.8,
        status: "NONLINEAR_SCHRODINGER_LOCKED",
      },
      {
        vault_id: "COSMIC-QUANTUM-PRESSURE",
        condensate_phase: "Cosmological Bohmian Quantum Pressure Treasury",
        healing_length_parsecs: 510.0,
        staked_capital_quadrillion_usd: 180.0,
        target_annual_yield_apy: 28.5,
        status: "QUANTUM_PRESSURE_STABILIZED",
      },
      {
        vault_id: "DARK-ENERGY-QUINTESSENCE-BEC",
        condensate_phase: "Cosmic Quintessence Axion Superfluid Reservoir",
        healing_length_parsecs: 640.0,
        staked_capital_quadrillion_usd: 160.0,
        target_annual_yield_apy: 28.7,
        status: "QUINTESSENCE_SUPERFLUID_ACTIVE",
      },
    ]);
  }
}
