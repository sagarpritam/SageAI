import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-wealth/allocations', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Wealth allocations:', error);
  }

  return NextResponse.json([
    {
      allocation_id: 'swf-alloc-critical-minerals',
      asset_class: 'Strategic Energy & Critical Minerals Reserve',
      sovereign_target_pct: 28.0,
      current_allocation_pct: 27.6,
      notional_aum_usd: 952200000000.0,
      liquidity_tier: 'TIER_1_SOVEREIGN_STRATEGIC',
      hedging_instrument: 'Physical Warehousing & Forward Contracts',
      risk_weight: 0.65,
      status: 'ALLOCATION_IN_TARGET_BAND',
    },
    {
      allocation_id: 'swf-alloc-compute-infra',
      asset_class: 'Planetary Compute Infrastructure & Fusion Supercluster Debt',
      sovereign_target_pct: 32.0,
      current_allocation_pct: 32.4,
      notional_aum_usd: 1117800000000.0,
      liquidity_tier: 'TIER_1_SOVEREIGN_STRATEGIC',
      hedging_instrument: 'Inflation-Indexed Sovereign Project Bonds',
      risk_weight: 0.55,
      status: 'ALLOCATION_IN_TARGET_BAND',
    },
    {
      allocation_id: 'swf-alloc-global-equity',
      asset_class: 'Global Technology & Semi Equities Multi-Factor Basket',
      sovereign_target_pct: 24.0,
      current_allocation_pct: 23.8,
      notional_aum_usd: 821100000000.0,
      liquidity_tier: 'TIER_2_LIQUID_MARKET',
      hedging_instrument: 'Synthetic Total Return Swaps',
      risk_weight: 0.85,
      status: 'ALLOCATION_IN_TARGET_BAND',
    },
    {
      allocation_id: 'swf-alloc-green-transition',
      asset_class: 'Geothermal & Superconducting Grid Transition Capital',
      sovereign_target_pct: 16.0,
      current_allocation_pct: 16.2,
      notional_aum_usd: 558900000000.0,
      liquidity_tier: 'TIER_1_SOVEREIGN_STRATEGIC',
      hedging_instrument: 'Green Sovereignty Sukuk & Senior Notes',
      risk_weight: 0.60,
      status: 'ALLOCATION_IN_TARGET_BAND',
    },
  ]);
}
