import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/geometric-langlands-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Geometric Langlands DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "LANGLANDS-AUTOMORPHIC-ALPHA",
      functor_type: "D-MOD-BUN_G-CATEGORICAL",
      staked_capital_quadrillion_usd: 480.0,
      projected_yield_apy_percent: 66.5,
      hecke_eigen_phase: "EIGENSHEAF-CONVERGED",
      status: "ACTIVE",
    },
    {
      vault_id: "HECKE-EIGENSHEAF-POOL",
      functor_type: "HECKE-MODIFICATION-ALGEBRA",
      staked_capital_quadrillion_usd: 430.0,
      projected_yield_apy_percent: 65.8,
      hecke_eigen_phase: "HECKE-EIGEN-ALIGNED",
      status: "ACTIVE",
    },
    {
      vault_id: "LOCAL-SYSTEMS-LOCSYS-DEX",
      functor_type: "QCOH-LOCSYS-SPECTRAL-SIDE",
      staked_capital_quadrillion_usd: 440.0,
      projected_yield_apy_percent: 66.2,
      hecke_eigen_phase: "LOCAL-SYSTEM-SEALED",
      status: "ACTIVE",
    },
    {
      vault_id: "WHITTAKER-NORMALIZATION-VAULT",
      functor_type: "POINCARE-DUALITY-WHITTAKER",
      staked_capital_quadrillion_usd: 350.0,
      projected_yield_apy_percent: 65.5,
      hecke_eigen_phase: "WHITTAKER-NORMALIZED",
      status: "ACTIVE",
    },
  ]);
}
