import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/planetary-magnetosphere/coils', {
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
        coil_id: 'mag-coil-equatorial-alpha-01',
        name: 'Equatorial Apex Superconducting Ring 01',
        orbital_plane: 'Equatorial (0.0° Inclination)',
        current_capacity_megaamps: 12.5,
        magnetic_field_strength_tesla: 8.2,
        cryocooling_efficiency_cop: 0.18,
        status: 'FIELD_INDUCTION_NOMINAL'
      },
      {
        coil_id: 'mag-coil-polar-meridian-02',
        name: 'Northern Auroral Cusp Diverter Coil 02',
        orbital_plane: 'Polar Meridian (88.5° Inclination)',
        current_capacity_megaamps: 9.8,
        magnetic_field_strength_tesla: 6.8,
        cryocooling_efficiency_cop: 0.16,
        status: 'FIELD_INDUCTION_NOMINAL'
      },
      {
        coil_id: 'mag-coil-austral-cusp-03',
        name: 'Southern Auroral Shielding Ring 03',
        orbital_plane: 'Polar Meridian (91.5° Inclination)',
        current_capacity_megaamps: 9.8,
        magnetic_field_strength_tesla: 6.8,
        cryocooling_efficiency_cop: 0.16,
        status: 'FIELD_INDUCTION_NOMINAL'
      },
      {
        coil_id: 'mag-coil-inclined-stabilizer-04',
        name: 'Mid-Latitude Geosynchronous Dynamo Link 04',
        orbital_plane: 'Inclined (45.0° Inclination)',
        current_capacity_megaamps: 11.2,
        magnetic_field_strength_tesla: 7.5,
        cryocooling_efficiency_cop: 0.17,
        status: 'FIELD_INDUCTION_NOMINAL'
      }
    ]);
  }
}
