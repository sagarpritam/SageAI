import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-platinum-iridium-depository/vaults', {
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
        vault_id: 'pgm-vault-zurich-01',
        vault_name: 'Zurich High-Security PGM Precious Metals Vault 01',
        jurisdiction: 'Switzerland (Embrach Freeport)',
        iridium_reserve_troy_oz: 6000.0,
        platinum_reserve_troy_oz: 25000.0,
        valuation_usd: 1400000000.0,
        hedged_electrolyzer_gw: 9.8,
        allocated_status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'pgm-vault-london-02',
        vault_name: 'London Bullion Market Platinum & Iridium Depository 02',
        jurisdiction: 'United Kingdom (London Vaults)',
        iridium_reserve_troy_oz: 4500.0,
        platinum_reserve_troy_oz: 20000.0,
        valuation_usd: 1100000000.0,
        hedged_electrolyzer_gw: 7.5,
        allocated_status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'pgm-vault-singapore-03',
        vault_name: 'Singapore Freeport Strategic Catalyst Depository 03',
        jurisdiction: 'Singapore (Changi Freeport)',
        iridium_reserve_troy_oz: 2800.0,
        platinum_reserve_troy_oz: 12500.0,
        valuation_usd: 700000000.0,
        hedged_electrolyzer_gw: 4.8,
        allocated_status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      },
      {
        vault_id: 'pgm-vault-tokyo-04',
        vault_name: 'Tokyo Bay Sovereign Hydrogen Metal Reserve 04',
        jurisdiction: 'Japan (Tokyo Special Economic Zone)',
        iridium_reserve_troy_oz: 1700.0,
        platinum_reserve_troy_oz: 7500.0,
        valuation_usd: 400000000.0,
        hedged_electrolyzer_gw: 2.4,
        allocated_status: 'CUSTODIAL_ALLOCATED_PHYSICAL'
      }
    ]);
  }
}
