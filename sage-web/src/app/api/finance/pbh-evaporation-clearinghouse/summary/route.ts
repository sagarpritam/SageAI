import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/pbh-evaporation-clearinghouse/summary', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      exchange_id: 'PBHE-HAWKING-DECAY-01',
      hawking_temperature_kelvin: 9.82e11,
      runaway_evaporation_luminosity_watts: 2.45e17,
      entropy_exhaustion_time_horizon_years: 42.5,
      total_securitized_evaporation_capital_quadrillion_usd: 510.0,
      annualized_decay_spread_apy: 18.4,
      active_evaporation_tranches: 4,
      last_settlement_epoch: new Date().toISOString()
    });
  }
}
