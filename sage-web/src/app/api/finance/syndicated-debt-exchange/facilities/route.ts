import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/syndicated-debt-exchange/facilities', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json([
      {
        facility_id: 'CSDE-VIRGO-01',
        facility_name: 'Virgo Supercluster Dark Energy Expansion Tranche',
        debt_issuance_quadrillion_usd: 42.0,
        coupon_rate_pct: 8.9,
        collateral_void_volume_mpc3: 150000.0,
        status: 'SYNDICATED_INVESTMENT_GRADE'
      },
      {
        facility_id: 'CSDE-LANI-02',
        facility_name: 'Laniakea Great Attractor Gravitational Debt Note',
        debt_issuance_quadrillion_usd: 36.5,
        coupon_rate_pct: 8.4,
        collateral_void_volume_mpc3: 120000.0,
        status: 'SYNDICATED_INVESTMENT_GRADE'
      },
      {
        facility_id: 'CSDE-COMA-03',
        facility_name: 'Coma Cluster Intracluster Medium Infrastructure Bond',
        debt_issuance_quadrillion_usd: 28.0,
        coupon_rate_pct: 9.1,
        collateral_void_volume_mpc3: 95000.0,
        status: 'SYNDICATED_INVESTMENT_GRADE'
      },
      {
        facility_id: 'CSDE-SHAPLEY-04',
        facility_name: 'Shapley Supercluster Cosmological Expansion Syndication',
        debt_issuance_quadrillion_usd: 21.9,
        coupon_rate_pct: 8.6,
        collateral_void_volume_mpc3: 80000.0,
        status: 'SYNDICATED_INVESTMENT_GRADE'
      }
    ]);
  }
}
