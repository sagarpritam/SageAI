import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-helium3-depository/summary', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Helium-3 Depository summary:', error);
  }

  return NextResponse.json({
    depository_id: 'lunar-helium3-clearinghouse-01',
    status: 'LUNAR_REGOLITH_HE3_CUSTODY_ACTIVE',
    total_allocated_he3_kg: 2500.0,
    fusion_energy_equivalent_petajoules: 2150.0,
    depository_valuation_usd: 25000000000.0,
    cleared_fusion_futures_volume_usd: 6250000000.0,
    isotopic_purity_pct: 99.9995,
    lunar_mining_surface_concessions: 6,
    participating_sovereign_fusion_grids: 16,
    last_depository_audit_timestamp: new Date().toISOString(),
  });
}
