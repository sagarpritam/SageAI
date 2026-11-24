import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/syndicated-debt-exchange/summary', {
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
      exchange_id: 'CSDE-KARDASHEV-MULTI-01',
      total_syndicated_debt_quadrillion_usd: 128.4,
      dark_energy_collateral_ratio: 2.85,
      cosmological_maturity_years: 1000000000000,
      average_coupon_rate_pct: 8.75,
      active_debt_facilities: 4,
      last_auction_timestamp: new Date().toISOString()
    });
  }
}
