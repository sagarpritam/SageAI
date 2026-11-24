import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-lithium-reserve/facilities', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Lithium Reserve facilities:', error);
  }

  return NextResponse.json([
    {
      facility_id: 'lithium-depot-nevada-01',
      name: 'Silver Peak Strategic Lithium Depot 01',
      location: 'Nevada, USA',
      physical_stock_tons: 75000.0,
      capacity_gwh_equivalent: 60.0,
      warehouse_receipt_audit: 'SEC_REGISTERED_PHYSICAL_ATTESTED',
      status: 'ALLOCATED_RESERVED',
    },
    {
      facility_id: 'lithium-depot-pilbara-02',
      name: 'Pilbara Sovereign Critical Minerals Hub 02',
      location: 'Western Australia',
      physical_stock_tons: 85000.0,
      capacity_gwh_equivalent: 68.0,
      warehouse_receipt_audit: 'ASX_TIER1_INDEPENDENT_ASSAYED',
      status: 'ALLOCATED_RESERVED',
    },
    {
      facility_id: 'lithium-depot-atacama-03',
      name: 'Salar de Atacama Strategic Brine Reserve 03',
      location: 'Antofagasta, Chile',
      physical_stock_tons: 50000.0,
      capacity_gwh_equivalent: 40.0,
      warehouse_receipt_audit: 'CENTRAL_BANK_COLLATERAL_VERIFIED',
      status: 'ALLOCATED_RESERVED',
    },
    {
      facility_id: 'lithium-depot-saxony-04',
      name: 'Saxony European Battery Corridor Depot 04',
      location: 'Dresden, Germany',
      physical_stock_tons: 30000.0,
      capacity_gwh_equivalent: 24.0,
      warehouse_receipt_audit: 'EU_CRITICAL_RAW_MATERIALS_CERTIFIED',
      status: 'ALLOCATED_RESERVED',
    },
  ]);
}
