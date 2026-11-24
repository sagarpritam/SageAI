import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/trans-galactic-wealth-fund/tranches', {
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
        tranche_id: 'TGWF-CORE-01',
        tranche_name: 'Galactic Core High-Spin Energy Debentures',
        allocation_quadrillion_usd: 16.5,
        relativistic_beta: 0.45,
        yield_apy: 16.2,
        jurisdiction: 'Sagittarius Central Clearinghouse',
        status: 'ACTIVE_ACCRETING'
      },
      {
        tranche_id: 'TGWF-ORION-02',
        tranche_name: 'Orion-Cygnus Compute Infrastructure Bonds',
        allocation_quadrillion_usd: 12.8,
        relativistic_beta: 0.62,
        yield_apy: 13.9,
        jurisdiction: 'Sol-Centauri Accord',
        status: 'ACTIVE_ACCRETING'
      },
      {
        tranche_id: 'TGWF-WORM-03',
        tranche_name: 'Traversable Wormhole Transit Securitization',
        allocation_quadrillion_usd: 9.5,
        relativistic_beta: 0.88,
        yield_apy: 15.4,
        jurisdiction: 'Basel VI Multi-Stellar Registry',
        status: 'ACTIVE_ACCRETING'
      },
      {
        tranche_id: 'TGWF-ENTROPY-04',
        tranche_name: 'Multiverse Thermodynamic Entropy Notes',
        allocation_quadrillion_usd: 7.0,
        relativistic_beta: 0.31,
        yield_apy: 12.8,
        jurisdiction: 'Kardashev Basel VII S-DAO',
        status: 'ACTIVE_ACCRETING'
      }
    ]);
  }
}
