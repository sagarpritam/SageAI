import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/universal-expansion-clearinghouse/summary', {
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
      clearinghouse_id: 'UEPC-HUBBLE-DECEL-01',
      hubble_constant_km_s_mpc: 67.4,
      dark_energy_equation_of_state_w: -1.02,
      cosmological_constant_lambda_m2: 1.11e-52,
      total_securitized_expansion_capital_quadrillion_usd: 340.0,
      expansion_repo_yield_apy: 13.85,
      active_derivative_tranches: 4,
      last_settlement_timestamp: new Date().toISOString()
    });
  }
}
