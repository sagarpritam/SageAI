import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/kardashev-futures-exchange/contracts', {
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
        contract_id: 'kex-contract-dyson-01',
        symbol: 'DYS-140G-PWH',
        name: 'Dyson 140 GHz Microwave Spot PWh',
        issuer: 'Dyson Swarm Sol Syndicate',
        notional_petawatt_hours: 250.0,
        price_per_mwh_usd: 48.5,
        settlement_type: 'PHYSICAL_RECTENNA_DELIVERY',
        credit_rating: 'AAA',
        status: 'ORDER_BOOK_ACTIVE'
      },
      {
        contract_id: 'kex-contract-fusion-02',
        symbol: 'HE3-CRYO-FWD',
        name: 'Helium-3 Cryogenic Forward Q4',
        issuer: 'Lunar Sovereign Authority',
        notional_petawatt_hours: 180.0,
        price_per_mwh_usd: 52.0,
        settlement_type: 'CRYOGENIC_CUSTODIAL_SETTLEMENT',
        credit_rating: 'AAA',
        status: 'ORDER_BOOK_ACTIVE'
      },
      {
        contract_id: 'kex-contract-geothermal-03',
        symbol: 'MOHO-PERP-SWP',
        name: 'Moho Baseload Perpetual Swap',
        issuer: 'Planetary Core Power Authority',
        notional_petawatt_hours: 120.0,
        price_per_mwh_usd: 44.0,
        settlement_type: 'CONTINUOUS_GRID_INJECTION',
        credit_rating: 'AA+',
        status: 'ORDER_BOOK_ACTIVE'
      },
      {
        contract_id: 'kex-contract-oort-04',
        symbol: 'KIN-TRN-BOND',
        name: 'Interstellar Transport Kinetic Bond',
        issuer: 'Extra-Planetary Habitat Alliance',
        notional_petawatt_hours: 90.0,
        price_per_mwh_usd: 55.5,
        settlement_type: 'ORBITAL_VELOCITY_CREDIT',
        credit_rating: 'AAA',
        status: 'ORDER_BOOK_ACTIVE'
      }
    ]);
  }
}
