import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-neutrino-relic/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Neutrino Relic vaults:", err);
    return NextResponse.json([
      {
        vault_id: "PRIMORDIAL-DECOUPLING-1S",
        relic_channel: "Big-Bang Neutrino Decoupling (t ~ 1s)",
        neutrino_energy_mev: 1.68e-4,
        staked_capital_quadrillion_usd: 240.0,
        target_annual_yield_apy: 32.5,
        status: "FREE_STREAMING_COHERENT",
      },
      {
        vault_id: "PTOLEMY-TRITIUM-CAPTURE",
        relic_channel: "Tritium Neutrino Capture on Graphene Target",
        neutrino_energy_mev: 1.86e-2,
        staked_capital_quadrillion_usd: 210.0,
        target_annual_yield_apy: 31.2,
        status: "INVERSE_BETA_RESONANT",
      },
      {
        vault_id: "FERMI-DIRAC-LEPTON-ASYMMETRY",
        relic_channel: "Primordial Lepton Asymmetry Degeneracy",
        neutrino_energy_mev: 2.15e-4,
        staked_capital_quadrillion_usd: 180.0,
        target_annual_yield_apy: 29.8,
        status: "CHEMICAL_POTENTIAL_BOUNDED",
      },
      {
        vault_id: "RELIC-NEUTRINO-CLUSTERING",
        relic_channel: "Galactic Dark Matter Halo Gravitational Clustering",
        neutrino_energy_mev: 5.40e-5,
        staked_capital_quadrillion_usd: 170.0,
        target_annual_yield_apy: 30.5,
        status: "GRAVITATIONAL_OVERDENSITY_HARVESTED",
      },
    ]);
  }
}
