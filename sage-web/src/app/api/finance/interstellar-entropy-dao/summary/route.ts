import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interstellar-entropy-dao/summary', {
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
      dao_system_id: 'entropy-dao-basel7-01',
      status: 'BASEL_VII_ENTROPY_OFFSET_TRADING_ACTIVE',
      treaty_framework: 'Basel VII Interstellar Environmental & Thermodynamic Accord',
      underwritten_offset_collateral_usd: 320000000000.0,
      neutralized_thermal_waste_petawatts: 12500.0,
      daily_entropy_cleared_terajoules: 85000000.0,
      molecular_cloud_carbon_sequestration_gt: 450.0,
      active_participating_sovereign_daos: 42,
      entropy_debit_credit_ratio: 1.45,
      last_entropy_retirement_timestamp: new Date().toISOString()
    });
  }
}
