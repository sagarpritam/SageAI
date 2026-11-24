import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/programmable-carbon-repo/facilities', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Programmable Carbon Repo facilities:', error);
  }

  return NextResponse.json([
    {
      facility_id: 'repo-gsib-overnight-a',
      name: 'Global G-SIB Overnight Liquidity Tranche A',
      borrower_type: 'Global Systemically Important Bank (G-SIB)',
      credit_limit_usd: 4000000000.0,
      utilized_amount_usd: 3100000000.0,
      collateral_coverage_pct: 105.0,
      settlement_tenor: 'OVERNIGHT_T_PLUS_0',
      status: 'COLLATERALIZED_ACTIVE',
    },
    {
      facility_id: 'repo-central-bank-window-b',
      name: 'Central Bank Carbon Standing Facility B',
      borrower_type: 'Sovereign Monetary Authority Window',
      credit_limit_usd: 3500000000.0,
      utilized_amount_usd: 2800000000.0,
      collateral_coverage_pct: 108.0,
      settlement_tenor: 'OVERNIGHT_T_PLUS_0',
      status: 'COLLATERALIZED_ACTIVE',
    },
    {
      facility_id: 'repo-green-reserve-c',
      name: 'Sovereign Green Reserve Discount Line C',
      borrower_type: 'National Strategic Climate Treasury',
      credit_limit_usd: 2500000000.0,
      utilized_amount_usd: 1950000000.0,
      collateral_coverage_pct: 110.0,
      settlement_tenor: 'TERM_30_DAYS',
      status: 'COLLATERALIZED_ACTIVE',
    },
    {
      facility_id: 'repo-mdb-liquidity-d',
      name: 'Multilateral Development Bank Liquidity Line D',
      borrower_type: 'Supranational Infrastructure Bank',
      credit_limit_usd: 2400000000.0,
      utilized_amount_usd: 1800000000.0,
      collateral_coverage_pct: 112.0,
      settlement_tenor: 'TERM_90_DAYS',
      status: 'COLLATERALIZED_ACTIVE',
    },
  ]);
}
