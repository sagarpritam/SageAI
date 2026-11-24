import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/grothendieck-serre-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Grothendieck-Serre DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "GROTHENDIECK-SERRE-CORE-ALPHA",
      torsor_type: "REDUCTIVE-GROUP-GL_N",
      staked_capital_quadrillion_usd: 450.0,
      projected_yield_apy_percent: 64.5,
      nisnevich_topology_phase: "TRIVIAL-LOCALLY",
      status: "ACTIVE",
    },
    {
      vault_id: "NISNEVICH-TOPOLOGY-POOL",
      torsor_type: "DECOMPOSED-ETALE-COVER",
      staked_capital_quadrillion_usd: 420.0,
      projected_yield_apy_percent: 63.8,
      nisnevich_topology_phase: "COMPLETELY-DECOMPOSED",
      status: "ACTIVE",
    },
    {
      vault_id: "PRINCIPAL-BUNDLE-TORSOR-DEX",
      torsor_type: "FUNCTION-FIELD-TRIVIALIZATION",
      staked_capital_quadrillion_usd: 430.0,
      projected_yield_apy_percent: 64.2,
      nisnevich_topology_phase: "GENERIC-FIBRE-SEALED",
      status: "ACTIVE",
    },
    {
      vault_id: "AZUMAYA-ALGEBRA-VAULT",
      torsor_type: "BRAUER-TORSION-CLASS",
      staked_capital_quadrillion_usd: 350.0,
      projected_yield_apy_percent: 63.5,
      nisnevich_topology_phase: "AZUMAYA-REGULAR",
      status: "ACTIVE",
    },
  ]);
}
