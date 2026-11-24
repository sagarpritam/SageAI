import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/universal-expansion-clearinghouse/tranches', {
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
        tranche_id: 'UEPC-TRANCHE-HUBBLE-01',
        tranche_name: 'Hubble Metric Acceleration Sovereign Facility',
        securitized_quadrillion_usd: 120.0,
        horizon_volume_gpc3: 415.0,
        yield_apy: 14.5,
        jurisdiction: 'Cosmic Event Horizon Reserve',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'UEPC-TRANCHE-DEUTSCH-02',
        tranche_name: 'Deceleration Metric Arbitrage Note',
        securitized_quadrillion_usd: 95.0,
        horizon_volume_gpc3: 320.0,
        yield_apy: 13.9,
        jurisdiction: 'Comoving Volume Treasury',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'UEPC-TRANCHE-LAMBDA-03',
        tranche_name: 'Vacuum Energy Density Perpetual Swap',
        securitized_quadrillion_usd: 75.0,
        horizon_volume_gpc3: 260.0,
        yield_apy: 13.2,
        jurisdiction: 'Dark Energy Clearing Consortium',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'UEPC-TRANCHE-COMOVING-04',
        tranche_name: 'Super-Horizon Inflaton Liquidity Facility',
        securitized_quadrillion_usd: 50.0,
        horizon_volume_gpc3: 190.0,
        yield_apy: 14.8,
        jurisdiction: 'Primordial Horizon Union',
        status: 'ACTIVE_COLLATERALIZED'
      }
    ]);
  }
}
