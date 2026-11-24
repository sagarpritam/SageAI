import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/dark-matter-halo-dao/summary', {
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
      dao_id: 'DMH-SECURITIZATION-DAO-01',
      total_underwritten_halo_mass_m_sun: 1.45e12,
      virial_velocity_dispersion_km_s: 225.0,
      total_securitized_capital_quadrillion_usd: 210.5,
      gravitational_repo_yield_apy: 11.45,
      active_halo_tranches: 4,
      last_issuance_timestamp: new Date().toISOString()
    });
  }
}
