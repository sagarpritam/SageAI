import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/nuclear-pasta-dao/summary', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      dao_id: 'NPYD-PULSAR-CRUST-01',
      nuclear_saturation_density_g_cm3: 2.8e14,
      crustal_shear_modulus_erg_cm3: 1.0e30,
      total_staked_compaction_capital_quadrillion_usd: 580.0,
      compaction_yield_apy: 22.4,
      active_pasta_phases: 4,
      last_compaction_rebalance_epoch: new Date().toISOString()
    });
  }
}
