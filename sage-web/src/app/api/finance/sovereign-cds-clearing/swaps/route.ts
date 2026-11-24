import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-cds-clearing/swaps', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign CDS Swaps list:', error);
  }

  return NextResponse.json([
    {
      swap_id: 'cds-g10-sovereign-basket',
      reference_entity: 'G10 Sovereign Benchmark Index Basket',
      gross_notional_usd: 4500000000.0,
      tenor: '5Y',
      spread_bps: 28.5,
      margin_collateral_usd: 650000000.0,
      clearing_status: 'FULLY_COLLATERALIZED',
      rating: 'AAA',
    },
    {
      swap_id: 'cds-emerging-market-infra',
      reference_entity: 'Emerging Market Subsea Infrastructure Sovereign Backstop',
      gross_notional_usd: 3200000000.0,
      tenor: '3Y',
      spread_bps: 64.2,
      margin_collateral_usd: 520000000.0,
      clearing_status: 'FULLY_COLLATERALIZED',
      rating: 'AA-',
    },
    {
      swap_id: 'cds-nordic-clean-energy',
      reference_entity: 'Nordic Sovereign Green Grid & Geothermal Bond Tranche',
      gross_notional_usd: 2800000000.0,
      tenor: '7Y',
      spread_bps: 18.4,
      margin_collateral_usd: 410000000.0,
      clearing_status: 'FULLY_COLLATERALIZED',
      rating: 'AAA',
    },
    {
      swap_id: 'cds-apac-datacenter-debt',
      reference_entity: 'Asia-Pacific Sovereign Hyperscale Cloud Debt Hedge',
      gross_notional_usd: 2000000000.0,
      tenor: '5Y',
      spread_bps: 34.0,
      margin_collateral_usd: 270000000.0,
      clearing_status: 'FULLY_COLLATERALIZED',
      rating: 'AA',
    },
  ]);
}
