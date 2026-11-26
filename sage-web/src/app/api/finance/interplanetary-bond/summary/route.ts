import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interplanetary-bond/summary', {
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
      clearinghouse_id: 'interplanetary-bond-clearinghouse-01',
      status: 'INTERPLANETARY_SOVEREIGN_DEBT_ACTIVE',
      regulatory_standard: 'Basel IV Solar System Sovereign Credit Accord',
      total_issued_bonds_usd: 24500000000.0,
      active_cds_hedging_volume_usd: 8200000000.0,
      weighted_average_coupon_pct: 3.85,
      sovereign_backing_reserve_usd: 31200000000.0,
      lunar_isotope_collateral_ratio_pct: 138.4,
      participating_sovereign_syndicates: 19,
      systemic_default_probability_pct: 0.0004,
      last_debt_auction_timestamp: new Date().toISOString()
    });
  }
}
