import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/pbh-evaporation-clearinghouse/tranches', {
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
        tranche_id: 'PBHE-TRANCHE-ULTRAFAST-BURST',
        tranche_name: 'Final-Stage Sub-Second Gamma Flash Tranche',
        pbh_mass_range_kg: '1.0e9 - 1.0e10',
        hawking_temp_kelvin: 1.22e14,
        notional_hedged_quadrillion_usd: 150.0,
        derivative_coupon_yield_apy: 24.5,
        risk_rating: 'AAA-PRIMORDIAL',
        status: 'SETTLED_HEDGED'
      },
      {
        tranche_id: 'PBHE-TRANCHE-CENTURY-DECAY',
        tranche_name: 'Decadal Hawking Steady Decay Tranche',
        pbh_mass_range_kg: '1.0e10 - 5.0e10',
        hawking_temp_kelvin: 2.45e13,
        notional_hedged_quadrillion_usd: 140.0,
        derivative_coupon_yield_apy: 19.2,
        risk_rating: 'AA-COSMIC',
        status: 'SETTLED_HEDGED'
      },
      {
        tranche_id: 'PBHE-TRANCHE-MILLENNIAL-HORIZON',
        tranche_name: 'Millennial Primordial Horizon Preservation Tranche',
        pbh_mass_range_kg: '5.0e10 - 1.5e11',
        hawking_temp_kelvin: 8.18e12,
        notional_hedged_quadrillion_usd: 120.0,
        derivative_coupon_yield_apy: 16.5,
        risk_rating: 'A-RELIC',
        status: 'SETTLED_HEDGED'
      },
      {
        tranche_id: 'PBHE-TRANCHE-EQUATORIAL-RESERVE',
        tranche_name: 'Equatorial Accretion Backstop Liquidity Tranche',
        pbh_mass_range_kg: '1.5e11 - 5.0e11',
        hawking_temp_kelvin: 2.73e12,
        notional_hedged_quadrillion_usd: 100.0,
        derivative_coupon_yield_apy: 13.4,
        risk_rating: 'AA-COSMIC',
        status: 'SETTLED_HEDGED'
      }
    ]);
  }
}
