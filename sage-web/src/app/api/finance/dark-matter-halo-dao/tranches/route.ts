import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/dark-matter-halo-dao/tranches', {
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
        tranche_id: 'DMH-CORE-NFW-01',
        tranche_name: 'Navarro-Frenk-White Cuspidal Core Tranche',
        securitized_quadrillion_usd: 75.0,
        density_profile_rho0_msun_kpc3: 14000000.0,
        yield_apy: 12.2,
        jurisdiction: 'Galactic Core Monetary Reserve',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'DMH-INTER-BURK-02',
        tranche_name: 'Burkert Intermediate Halo Density Bond',
        securitized_quadrillion_usd: 58.5,
        density_profile_rho0_msun_kpc3: 8200000.0,
        yield_apy: 11.5,
        jurisdiction: 'Orion-Cygnus Sovereign Consortium',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'DMH-OUTER-EIN-03',
        tranche_name: 'Einasto Outer Virial Boundary Note',
        securitized_quadrillion_usd: 45.0,
        density_profile_rho0_msun_kpc3: 4500000.0,
        yield_apy: 10.8,
        jurisdiction: 'Perseus Outer Arm Treasury',
        status: 'ACTIVE_COLLATERALIZED'
      },
      {
        tranche_id: 'DMH-SUBHALO-TID-04',
        tranche_name: 'Magellanic Stream Tidal Subhalo Debenture',
        securitized_quadrillion_usd: 32.0,
        density_profile_rho0_msun_kpc3: 3100000.0,
        yield_apy: 11.0,
        jurisdiction: 'Satellites Interstellar Union',
        status: 'ACTIVE_COLLATERALIZED'
      }
    ]);
  }
}
