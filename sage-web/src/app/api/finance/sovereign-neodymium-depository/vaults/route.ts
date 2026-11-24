import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-neodymium-depository/vaults', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Neodymium Depository vaults:', error);
  }

  return NextResponse.json([
    {
      vault_id: 'ndfeb-depot-rotterdam-01',
      name: 'Port of Rotterdam Strategic Critical Minerals Vault 01',
      location: 'Rotterdam, Netherlands',
      stock_metric_tons: 3800.0,
      grade: 'N52SH (High-Temp Sintered)',
      offtake_coverage_pct: 82.5,
      audit_standard: 'INERT_ATMOSPHERE_LASER_INTERFEROMETRIC_VERIFIED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'ndfeb-depot-texas-freeport-02',
      name: 'Gulf Coast Energy Transition Rare-Earth Depository 02',
      location: 'Freeport, Texas, USA',
      stock_metric_tons: 3400.0,
      grade: 'N50UH (Ultra-High Coercivity)',
      offtake_coverage_pct: 79.0,
      audit_standard: 'US_DEFENSE_LOGISTICS_AGENCY_CROSS_ATTESTED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'ndfeb-depot-singapore-jurong-03',
      name: 'Jurong Island Deep Strategic Reserve 03',
      location: 'Jurong Port, Singapore',
      stock_metric_tons: 2600.0,
      grade: 'N54 (Max Magnetic Energy Product)',
      offtake_coverage_pct: 86.0,
      audit_standard: 'INERT_ATMOSPHERE_LASER_INTERFEROMETRIC_VERIFIED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'ndfeb-depot-kiruna-nordic-04',
      name: 'Kiruna Subterranean Arctic Vault 04',
      location: 'Norrbotten, Sweden',
      stock_metric_tons: 2200.0,
      grade: 'N48EH (Extreme Thermal Aerospace)',
      offtake_coverage_pct: 88.5,
      audit_standard: 'EU_CRITICAL_RAW_MATERIALS_ACT_COMPLIANT',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
  ]);
}
