import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/carbon-negative-fuel/summary', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Carbon Negative Fuel summary:', error);
  }

  return NextResponse.json({
    exchange_id: 'dac-synfuel-energy-clearing-01',
    status: 'SYNTHETIC_COMMODITY_CLEARING_ACTIVE',
    total_co2_sequestered_metric_tons: 1850000.0,
    daily_synfuel_production_barrels: 45000.0,
    fischer_tropsch_catalytic_efficiency_pct: 91.4,
    lifecycle_carbon_intensity_gco2e_per_mj: -24.8,
    sovereign_strategic_reserve_barrels: 1200000.0,
    cleared_trade_volume_usd: 1450000000.0,
    active_refineries: 6,
    last_fuel_settlement_timestamp: new Date().toISOString(),
  });
}
