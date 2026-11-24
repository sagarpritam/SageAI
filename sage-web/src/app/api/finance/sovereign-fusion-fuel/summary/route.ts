import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-fusion-fuel/summary', {
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
      clearinghouse_id: 'fusion-fuel-clearinghouse-01',
      status: 'BASEL_III_FUSION_RESERVE_ACTIVE',
      regulatory_framework: 'Basel III Extra-Planetary Sovereign Fuel Accord',
      total_custodial_deuterium_kg: 18000.0,
      total_custodial_helium3_kg: 7000.0,
      aggregate_thermal_energy_petajoules: 18500.0,
      clearinghouse_valuation_usd: 6800000000.0,
      cleared_power_purchase_hedging_usd: 2450000000.0,
      deuterium_purity_pct: 99.995,
      helium3_purity_pct: 99.999,
      participating_fusion_giga_reactors: 22,
      last_custodial_assay_timestamp: new Date().toISOString()
    });
  }
}
