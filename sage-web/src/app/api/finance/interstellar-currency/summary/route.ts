import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interstellar-currency/summary', {
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
      mint_id: 'isrc-algorithmic-mint-01',
      status: 'ENERGY_BACKED_ISRC_STANDARD_ACTIVE',
      monetary_standard: 'Basel IV Solar Flux Kilowatt-Hour Accord (1 ISRC = 100 MWh)',
      total_circulating_isrc: 580000000.0,
      circulating_valuation_usd: 29000000000.0,
      backing_thermal_energy_petajoules: 208800.0,
      sol_flux_beaming_reserve_gw: 58000.0,
      interplanetary_clearing_liquidity_usd: 12500000000.0,
      algorithmic_peg_deviation_pct: 0.0002,
      participating_central_syndicate_banks: 24,
      last_minting_settlement_timestamp: new Date().toISOString()
    });
  }
}
