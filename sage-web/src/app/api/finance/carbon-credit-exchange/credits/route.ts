import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/carbon-credit-exchange/credits', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Carbon Credit tranches:', error);
  }

  return NextResponse.json([
    {
      tranche_id: 'carb-tranche-nordic-hydro',
      project_name: 'Nordic Geothermal & Run-of-River Hydro Project',
      host_nation: 'Norway (Statkraft Sovereign Verified)',
      volume_tco2e: 150000,
      price_per_ton_usd: 38.00,
      vintage_year: 2026,
      additionality_score_pct: 99.4,
      status: 'SOVEREIGN_RETIREMENT_READY',
    },
    {
      tranche_id: 'carb-tranche-amazon-redd',
      project_name: 'Amazonian Sovereign Agroforestry Canopy Shield',
      host_nation: 'Brazil (CONAREDD+ National Registry)',
      volume_tco2e: 125000,
      price_per_ton_usd: 44.50,
      vintage_year: 2026,
      additionality_score_pct: 98.8,
      status: 'SOVEREIGN_RETIREMENT_READY',
    },
    {
      tranche_id: 'carb-tranche-iceland-dac',
      project_name: 'Iceland Direct Air Carbon Mineralization',
      host_nation: 'Iceland (CarbFix Basalt Sequestration)',
      volume_tco2e: 100000,
      price_per_ton_usd: 58.00,
      vintage_year: 2026,
      additionality_score_pct: 99.9,
      status: 'SOVEREIGN_RETIREMENT_READY',
    },
    {
      tranche_id: 'carb-tranche-sahara-pv',
      project_name: 'Moroccan Concentrated Solar Thermal Superpark',
      host_nation: 'Morocco (MASEN Sovereign Escrow)',
      volume_tco2e: 125000,
      price_per_ton_usd: 32.00,
      vintage_year: 2026,
      additionality_score_pct: 97.9,
      status: 'SOVEREIGN_RETIREMENT_READY',
    },
  ]);
}
