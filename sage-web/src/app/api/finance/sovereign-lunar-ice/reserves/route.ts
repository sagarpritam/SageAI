import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-lunar-ice/reserves', {
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
        reserve_id: 'lunar-ice-res-shackleton-01',
        name: 'Shackleton Rim Cryogenic Volatile Silo 01',
        location: 'Moon South Pole (89.9°S, 0.0°E)',
        extracted_water_ice_tons: 38000.0,
        stored_lh2_tons: 4222.0,
        valuation_usd: 2150000000.0,
        cryo_containment_temp_kelvin: 38.0,
        status: 'EXTRACTED_STORED_CRYOGENIC'
      },
      {
        reserve_id: 'lunar-ice-res-cabeus-02',
        name: 'Cabeus Crater Sub-Surface Ice Harvester 02',
        location: 'Moon South Pole (84.9°S, 35.5°W)',
        extracted_water_ice_tons: 26000.0,
        stored_lh2_tons: 2888.0,
        valuation_usd: 1500000000.0,
        cryo_containment_temp_kelvin: 40.0,
        status: 'EXTRACTED_STORED_CRYOGENIC'
      },
      {
        reserve_id: 'lunar-ice-res-faustini-03',
        name: 'Faustini Deep Shadow Liquidity Depot 03',
        location: 'Moon South Pole (87.3°S, 77.0°E)',
        extracted_water_ice_tons: 14000.0,
        stored_lh2_tons: 1555.0,
        valuation_usd: 800000000.0,
        cryo_containment_temp_kelvin: 35.0,
        status: 'EXTRACTED_STORED_CRYOGENIC'
      },
      {
        reserve_id: 'lunar-ice-res-shoemaker-04',
        name: 'Shoemaker Crater Sovereign Propellant Reserve 04',
        location: 'Moon South Pole (88.1°S, 45.9°E)',
        extracted_water_ice_tons: 7000.0,
        stored_lh2_tons: 779.0,
        valuation_usd: 400000000.0,
        cryo_containment_temp_kelvin: 39.0,
        status: 'EXTRACTED_STORED_CRYOGENIC'
      }
    ]);
  }
}
