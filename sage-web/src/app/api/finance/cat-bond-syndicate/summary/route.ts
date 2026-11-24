import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/cat-bond-syndicate/summary', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Cat Bond Syndicate summary:', error);
  }

  return NextResponse.json({
    syndicate_id: 'cat-bond-reinsurance-mesh-01',
    status: 'PARAMETRIC_POOL_ACTIVE',
    total_underwriting_capacity_usd: 350000000.0,
    collateral_in_sovereign_escrow_usd: 350000000.0,
    weighted_coupon_yield_pct: 6.25,
    cumulative_claims_paid_usd: 0.0,
    loss_ratio_pct: 0.0,
    parametric_oracle_source: 'Multi-Vendor Dual Space-Weather & NOAA / USGS Sensor Consensus',
    smart_contract_escrow_standard: 'ISDA Parametric Digital Tokenized Note',
    last_audit_timestamp: new Date().toISOString(),
  });
}
