import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/trans-galactic-wealth-fund/summary', {
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
      fund_id: 'TGWF-RESERVE-SOV-01',
      aum_quadrillion_usd: 45.8,
      sovereign_governance: 'Intergalactic Monetary Union (IMU)',
      relativistic_arbitrage_yield_apy: 14.85,
      time_dilation_hedging_ratio: 1.95,
      multiverse_synthetic_reserves_pct: 38.4,
      active_sovereign_tranches: 4,
      last_rebalance_timestamp: new Date().toISOString()
    });
  }
}
