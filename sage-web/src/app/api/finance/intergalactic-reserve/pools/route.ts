import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/intergalactic-reserve/pools', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json([
      {
        pool_id: 'pool-sol-alpha-centauri-01',
        name: 'Sol-Alpha Centauri Relativistic Settlement Pool',
        counterparty: 'Rigil Kentaurus Sovereign Treasury',
        liquidity_usd: 85000000000.0,
        settlement_tenor_years: 4.37,
        dilation_spread_bps: 12.4,
        status: 'POOL_LIQUID_PRIME'
      },
      {
        pool_id: 'pool-sol-sirius-02',
        name: 'Sol-Sirius Binary Arc Liquidity Depository',
        counterparty: 'Sirian Interstellar Commerce Guild',
        liquidity_usd: 65000000000.0,
        settlement_tenor_years: 8.6,
        dilation_spread_bps: 18.2,
        status: 'POOL_LIQUID_PRIME'
      },
      {
        pool_id: 'pool-sol-procyon-03',
        name: 'Sol-Procyon Sub-Sector Forward Liquidity Ring',
        counterparty: 'Procyon Planetary Federation',
        liquidity_usd: 50000000000.0,
        settlement_tenor_years: 11.46,
        dilation_spread_bps: 22.8,
        status: 'FORWARD_TRADING_ACTIVE'
      },
      {
        pool_id: 'pool-sol-vega-04',
        name: 'Vega Circumstellar Macro-Clearing Vault',
        counterparty: 'Lyran Trans-Stellar Syndicate',
        liquidity_usd: 40000000000.0,
        settlement_tenor_years: 25.04,
        dilation_spread_bps: 34.5,
        status: 'COLLATERAL_LOCKED_TRIPLE_A'
      }
    ]);
  }
}
