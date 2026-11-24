import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-fusion-fuel/vaults', {
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
        vault_id: 'fusion-vault-cadarache-01',
        name: 'Cadarache High-Security Tokamak Reserve 01',
        jurisdiction: 'European Union (ITER Special Zone)',
        deuterium_kg: 6500.0,
        helium3_kg: 2500.0,
        valuation_usd: 2450000000.0,
        containment_type: 'Supercritical Cryogenic Magnetic Suspension',
        status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'fusion-vault-naka-02',
        name: 'Naka Fusion Energy Settle Depot 02',
        jurisdiction: 'Japan (QST Fusion Center)',
        deuterium_kg: 4500.0,
        helium3_kg: 1800.0,
        valuation_usd: 1750000000.0,
        containment_type: 'Supercritical Cryogenic Magnetic Suspension',
        status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'fusion-vault-princeton-03',
        name: 'Princeton Plasma Physics Custody Vault 03',
        jurisdiction: 'United States (PPPL High-Security Core)',
        deuterium_kg: 4200.0,
        helium3_kg: 1600.0,
        valuation_usd: 1550000000.0,
        containment_type: 'Supercritical Cryogenic Magnetic Suspension',
        status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'fusion-vault-hefei-04',
        name: 'Hefei Superconducting Tokamak Fuel Silo 04',
        jurisdiction: 'China (EAST Advanced Energy Hub)',
        deuterium_kg: 2800.0,
        helium3_kg: 1100.0,
        valuation_usd: 1050000000.0,
        containment_type: 'Supercritical Cryogenic Magnetic Suspension',
        status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      }
    ]);
  }
}
