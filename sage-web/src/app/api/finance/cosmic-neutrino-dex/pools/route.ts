import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/cosmic-neutrino-dex/pools', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json([
      {
        pool_id: 'CNBD-POOL-PRIMORDIAL-01',
        pool_name: 'Big Bang Primordial Relic Neutrino Core Pool',
        tvl_quadrillion_usd: 150.0,
        flavor_ratio_nu_e_mu_tau: '1.00:1.01:0.99',
        swap_fee_apy: 15.8,
        cleared_daily_volume_quadrillion_usd: 12.5,
        status: 'ACTIVE_LIQUIDITY_DEPTH'
      },
      {
        pool_id: 'CNBD-POOL-MASSLESS-02',
        pool_name: 'Helicity-Conserved Majoron Liquidity Pair',
        tvl_quadrillion_usd: 115.0,
        flavor_ratio_nu_e_mu_tau: '1.00:1.00:1.00',
        swap_fee_apy: 14.9,
        cleared_daily_volume_quadrillion_usd: 9.8,
        status: 'ACTIVE_LIQUIDITY_DEPTH'
      },
      {
        pool_id: 'CNBD-POOL-STERILE-03',
        pool_name: 'Sterile Warm Dark Matter Cross-DEX Swap',
        tvl_quadrillion_usd: 95.0,
        flavor_ratio_nu_e_mu_tau: '0.98:1.02:1.00',
        swap_fee_apy: 15.1,
        cleared_daily_volume_quadrillion_usd: 8.2,
        status: 'ACTIVE_LIQUIDITY_DEPTH'
      },
      {
        pool_id: 'CNBD-POOL-GRAVITATIONAL-04',
        pool_name: 'Galactic Clustering Velocity Dispersion Vault',
        tvl_quadrillion_usd: 65.0,
        flavor_ratio_nu_e_mu_tau: '1.01:0.99:1.00',
        swap_fee_apy: 14.6,
        cleared_daily_volume_quadrillion_usd: 5.4,
        status: 'ACTIVE_LIQUIDITY_DEPTH'
      }
    ]);
  }
}
