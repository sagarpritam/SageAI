import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/nuclear-pasta-dao/phases', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json([
      {
        phase_id: 'NPYD-PHASE-GNOCCHI-01',
        phase_name: 'Spherical Nuclei Gnocchi Droplet Vault',
        baryon_density_fm3: 0.035,
        proton_fraction_y_p: 0.12,
        staked_capital_quadrillion_usd: 160.0,
        phase_yield_apy: 26.5,
        shear_resilience_rating: 'AAA-CRUSTAL',
        status: 'COMPACTION_YIELD_OPTIMAL'
      },
      {
        phase_id: 'NPYD-PHASE-SPAGHETTI-02',
        phase_name: 'Cylindrical Rod Spaghetti Column Vault',
        baryon_density_fm3: 0.055,
        proton_fraction_y_p: 0.15,
        staked_capital_quadrillion_usd: 150.0,
        phase_yield_apy: 23.2,
        shear_resilience_rating: 'AA-PULSAR',
        status: 'COMPACTION_YIELD_OPTIMAL'
      },
      {
        phase_id: 'NPYD-PHASE-LASAGNA-03',
        phase_name: 'Planar Slab Lasagna Sheet Vault',
        baryon_density_fm3: 0.085,
        proton_fraction_y_p: 0.20,
        staked_capital_quadrillion_usd: 140.0,
        phase_yield_apy: 20.8,
        shear_resilience_rating: 'AA-PULSAR',
        status: 'COMPACTION_YIELD_OPTIMAL'
      },
      {
        phase_id: 'NPYD-PHASE-SWISS-CHEESE-04',
        phase_name: 'Inverted Bubble Swiss Cheese Void Vault',
        baryon_density_fm3: 0.115,
        proton_fraction_y_p: 0.25,
        staked_capital_quadrillion_usd: 130.0,
        phase_yield_apy: 19.1,
        shear_resilience_rating: 'A-DEGENERATE',
        status: 'COMPACTION_YIELD_OPTIMAL'
      }
    ]);
  }
}
