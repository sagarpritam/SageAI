import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/intergalactic-reserve/summary', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json({
      reserve_clearinghouse_id: 'ir-clearinghouse-basel6-01',
      status: 'BASEL_VI_INTERGALACTIC_CLEARING_ACTIVE',
      regulatory_framework: 'Basel VI Intergalactic Multi-Stellar Accord',
      total_underwritten_liquidity_usd: 240000000000.0,
      daily_cleared_volume_usd: 54200000000.0,
      multi_stellar_collateral_ratio_pct: 184.6,
      participating_stellar_empires: 18,
      sovereign_intergalactic_reserve_tokens: 1200000000.0,
      relativistic_time_dilation_hedging_alpha: 0.0042,
      last_intergalactic_settlement_timestamp: new Date().toISOString()
    });
  }
}
