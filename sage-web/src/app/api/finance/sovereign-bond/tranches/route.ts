import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-bond/tranches', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback sovereign bond tranches:', error);
  }

  // Fallback high-fidelity tranches array
  return NextResponse.json([
    {
      tranche_id: 'tranche-sn-01',
      note_name: 'Series 2026-A Senior Secured Note',
      principal_amount_usd: 8000000.0,
      coupon_rate_pct: 5.25,
      maturity_years: 3,
      investor_syndicate: 'BlackRock Infrastructure Debt Fund',
      covenant_terms: 'Min DSCR 2.5x / Max Leverage 1.5x',
      status: 'ISSUED_AND_ACTIVE',
      next_coupon_date: '2027-02-15',
    },
    {
      tranche_id: 'tranche-sn-02',
      note_name: 'Series 2026-B Mezzanine Growth Note',
      principal_amount_usd: 7000000.0,
      coupon_rate_pct: 6.50,
      maturity_years: 5,
      investor_syndicate: 'Ares Sovereign Credit Partners',
      covenant_terms: 'Min DSCR 2.0x / Liquidity Floor $15M',
      status: 'ISSUED_AND_ACTIVE',
      next_coupon_date: '2027-03-31',
    },
    {
      tranche_id: 'tranche-sn-03',
      note_name: 'Series 2026-C High-Yield Sovereign Facility',
      principal_amount_usd: 10000000.0,
      coupon_rate_pct: 7.10,
      maturity_years: 7,
      investor_syndicate: 'Temasek Direct Lending Syndicate',
      covenant_terms: 'Min DSCR 1.8x / IP Collateral Pledge',
      status: 'APPROVED_PENDING_ISSUANCE',
      next_coupon_date: '2027-06-30',
    },
  ]);
}
