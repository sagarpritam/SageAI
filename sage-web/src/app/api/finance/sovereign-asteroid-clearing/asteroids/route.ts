import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-asteroid-clearing/asteroids', {
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
        asteroid_id: 'nea-1986-da-01',
        name: 'Asteroid (3554) Amun M-Type Core 01',
        spectral_class: 'M-type (Metallic)',
        semi_major_axis_au: 0.974,
        estimated_mass_million_tons: 180.0,
        platinum_reserve_tons: 1200.0,
        nickel_reserve_million_tons: 14.5,
        valuation_usd: 3100000000.0,
        status: 'ASSAYED_SECURED_ORBITAL'
      },
      {
        asteroid_id: 'nea-16-psyche-orbit-02',
        name: 'Fragment Psyche-Beta-02 Orbital Cluster',
        spectral_class: 'M-type (Metallic Core)',
        semi_major_axis_au: 2.92,
        estimated_mass_million_tons: 140.0,
        platinum_reserve_tons: 850.0,
        nickel_reserve_million_tons: 10.2,
        valuation_usd: 2200000000.0,
        status: 'ASSAYED_SECURED_ORBITAL'
      },
      {
        asteroid_id: 'nea-1986-da-fragment-03',
        name: 'Near-Earth Asteroid 1986 DA Core Voucher 03',
        spectral_class: 'M-type (High Iron-Nickel)',
        semi_major_axis_au: 1.25,
        estimated_mass_million_tons: 80.0,
        platinum_reserve_tons: 500.0,
        nickel_reserve_million_tons: 5.1,
        valuation_usd: 1250000000.0,
        status: 'ASSAYED_SECURED_ORBITAL'
      },
      {
        asteroid_id: 'nea-2011-uw158-04',
        name: 'Asteroid 2011 UW158 Platinum Rich Vault 04',
        spectral_class: 'M-type (Precious PGM)',
        semi_major_axis_au: 1.62,
        estimated_mass_million_tons: 50.0,
        platinum_reserve_tons: 250.0,
        nickel_reserve_million_tons: 2.2,
        valuation_usd: 650000000.0,
        status: 'ASSAYED_SECURED_ORBITAL'
      }
    ]);
  }
}
