import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interstellar-entropy-dao/vaults', {
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
        vault_id: 'vault-orion-cloud-01',
        name: 'Orion Molecular Cloud Thermal Sink Vault',
        location: 'Orion Nebula Complex (1,344 ly)',
        capacity_petajoules: 4500000.0,
        price_per_petajoule_usd: 18500.0,
        cooling_efficiency_pct: 99.98,
        status: 'VAULT_OPEN_OFFSETTING'
      },
      {
        vault_id: 'vault-taurus-dust-02',
        name: 'Taurus Molecular Cloud Carbon Repository',
        location: 'Taurus Auriga Dust Complex (430 ly)',
        capacity_petajoules: 3200000.0,
        price_per_petajoule_usd: 21000.0,
        cooling_efficiency_pct: 99.96,
        status: 'VAULT_OPEN_OFFSETTING'
      },
      {
        vault_id: 'vault-rosette-nebula-03',
        name: 'Rosette HII Ionization Sequestration Node',
        location: 'Monoceros Ring Edge (5,000 ly)',
        capacity_petajoules: 6800000.0,
        price_per_petajoule_usd: 15400.0,
        cooling_efficiency_pct: 99.99,
        status: 'SEQUESTERING_CONTINUOUS'
      },
      {
        vault_id: 'vault-eagle-pillars-04',
        name: 'Eagle Pillars Deep-Cold Thermodynamic Sink',
        location: 'Serpens Cloud Core (7,000 ly)',
        capacity_petajoules: 8500000.0,
        price_per_petajoule_usd: 12800.0,
        cooling_efficiency_pct: 99.995,
        status: 'PRIME_SINK_LOCKED'
      }
    ]);
  }
}
