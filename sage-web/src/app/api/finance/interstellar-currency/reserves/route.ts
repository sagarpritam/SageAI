import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/interstellar-currency/reserves', {
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
        vault_id: 'isrc-vault-sol-01',
        name: 'Sol-Dyson Sovereign Energy Depository',
        location: 'Orbital L1 Storage Nexus',
        energy_petajoules: 85000.0,
        minted_isrc: 236111111,
        backing_asset: '140 GHz Beamed Solar Microwave Offtake',
        status: 'AUDITED_BACKED'
      },
      {
        vault_id: 'isrc-vault-luna-02',
        name: 'Lunar Polar Superconducting Energy Bank',
        location: 'Shackleton Depository',
        energy_petajoules: 48000.0,
        minted_isrc: 133333333,
        backing_asset: 'Cryogenic Superconducting Inductive Coils',
        status: 'AUDITED_BACKED'
      },
      {
        vault_id: 'isrc-vault-mars-03',
        name: 'Martian Phobos Storage Syndicate',
        location: 'Phobos Low Orbit',
        energy_petajoules: 42000.0,
        minted_isrc: 116666667,
        backing_asset: 'Orbital Tether Flywheel Kinetic Storage',
        status: 'AUDITED_BACKED'
      },
      {
        vault_id: 'isrc-vault-lagrange-04',
        name: 'Lagrange L5 Habitat Reserve Fund',
        location: 'O\'Neill L5 Banking Vault',
        energy_petajoules: 33800.0,
        minted_isrc: 93888889,
        backing_asset: 'MHD Closed-Cycle Power Reserves',
        status: 'AUDITED_BACKED'
      }
    ]);
  }
}
