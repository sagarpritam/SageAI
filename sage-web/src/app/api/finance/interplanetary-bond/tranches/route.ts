import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interplanetary-bond/tranches', {
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
        tranche_id: 'bond-tranche-luna-01',
        name: 'Lunar Polar Infrastructure Sovereign 10Y',
        issuer: 'Lunar Sovereign Authority',
        notional_usd: 6500000000.0,
        coupon_pct: 3.45,
        maturity_year: 2036,
        credit_rating: 'AAA',
        collateral_backing: 'Helium-3 & Polar Water Ice Reserves',
        status: 'AUCTION_SETTLED'
      },
      {
        tranche_id: 'bond-tranche-mars-02',
        name: 'Mars Orbital Elevator Construction 15Y',
        issuer: 'Martian Development Coalition',
        notional_usd: 8000000000.0,
        coupon_pct: 4.10,
        maturity_year: 2041,
        credit_rating: 'AA+',
        collateral_backing: 'Areostationary Anchor Tether Toll Rights',
        status: 'AUCTION_SETTLED'
      },
      {
        tranche_id: 'bond-tranche-asteroid-03',
        name: 'Asteroid Mining Kinetic Transport 7Y',
        issuer: 'Ceres Resource Syndicate',
        notional_usd: 5000000000.0,
        coupon_pct: 3.90,
        maturity_year: 2033,
        credit_rating: 'AAA',
        collateral_backing: 'Assayed Platinum-Nickel M-Type Asteroids',
        status: 'AUCTION_SETTLED'
      },
      {
        tranche_id: 'bond-tranche-lagrange-04',
        name: 'L4/L5 O\'Neill Habitat Habitat 20Y',
        issuer: 'Extra-Planetary Habitat Alliance',
        notional_usd: 5000000000.0,
        coupon_pct: 3.75,
        maturity_year: 2046,
        credit_rating: 'AAA',
        collateral_backing: 'Centrifugal Habitat Agriculture Offtake',
        status: 'AUCTION_SETTLED'
      }
    ]);
  }
}
