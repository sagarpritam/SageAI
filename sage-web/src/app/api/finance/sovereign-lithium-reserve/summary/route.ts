import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-lithium-reserve/summary', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Lithium Reserve summary:', error);
  }

  return NextResponse.json({
    facility_id: 'sovereign-lithium-reserve-clearing-01',
    status: 'BATTERY_GRADE_LIOH_ACTIVE',
    total_physical_reserve_metric_tons: 240000.0,
    reserve_market_value_usd: 18480000000.0,
    allocated_warehouse_jurisdictions: 'Nevada, Western Australia, Atacama, Saxony',
    active_battery_swap_volume_usd: 4650000000.0,
    swap_tenor_months: 12,
    purity_grade_standard: 'BATTERY_GRADE_99_5_PERCENT_LIOH_MONOHYDRATE',
    participating_gigafactories: 18,
    last_reserve_swap_timestamp: new Date().toISOString(),
  });
}
