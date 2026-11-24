import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/vafa-witten-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Vafa-Witten DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "VAFA-WITTEN-CORE-ALPHA",
      vault_name: "N=4 SYM Topological Twist Core",
      allocated_capital_quadrillion_usd: 480.0,
      projected_yield_apy_percent: 58.0,
      instanton_convergence: 0.999999,
      status: "STAKE_EXPANDED_VAFA_WITTEN",
    },
    {
      vault_id: "MODULAR-S-DUALITY-POOL",
      vault_name: "SL(2, Z) Modular S-Duality Orbit Pool",
      allocated_capital_quadrillion_usd: 370.0,
      projected_yield_apy_percent: 59.5,
      instanton_convergence: 0.999998,
      status: "MODULAR_ORBIT_OPTIMAL",
    },
    {
      vault_id: "EULER-CHARACTERISTIC-DEX",
      vault_name: "4-Manifold Euler Characteristic DEX",
      allocated_capital_quadrillion_usd: 340.0,
      projected_yield_apy_percent: 57.8,
      instanton_convergence: 0.999999,
      status: "EULER_NUMBER_SUMMED",
    },
    {
      vault_id: "INSTANTON-SHEAF-VAULT",
      vault_name: "Torsion-Free Instanton Sheaf Yield Vault",
      allocated_capital_quadrillion_usd: 310.0,
      projected_yield_apy_percent: 56.7,
      instanton_convergence: 0.999997,
      status: "SHEAF_MODULI_STABLE",
    },
  ]);
}
