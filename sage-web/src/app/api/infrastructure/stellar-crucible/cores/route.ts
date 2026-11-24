import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stellar-crucible/cores', {
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
        core_id: 'CORE-OMC1-ALPHA',
        core_name: 'Theta1 Orionis Progenitor Alpha',
        mass_solar_masses: 12.4,
        core_temp_mega_kelvin: 42.5,
        magnetic_pinch_tesla: 8500.0,
        status: 'STELLAR_NUCLEOSYNTHESIS_ACTIVE'
      },
      {
        core_id: 'CORE-OMC1-BETA',
        core_name: 'Becklin-Neugebauer Accretion Node',
        mass_solar_masses: 8.7,
        core_temp_mega_kelvin: 36.2,
        magnetic_pinch_tesla: 8200.0,
        status: 'STELLAR_NUCLEOSYNTHESIS_ACTIVE'
      },
      {
        core_id: 'CORE-OMC1-GAMMA',
        core_name: 'Kleinmann-Low Deep Protostar',
        mass_solar_masses: 15.1,
        core_temp_mega_kelvin: 48.0,
        magnetic_pinch_tesla: 8900.0,
        status: 'STELLAR_NUCLEOSYNTHESIS_ACTIVE'
      },
      {
        core_id: 'CORE-OMC1-DELTA',
        core_name: 'Trapezium Outflow Feeder',
        mass_solar_masses: 6.2,
        core_temp_mega_kelvin: 28.5,
        magnetic_pinch_tesla: 7800.0,
        status: 'ACCRETION_STABILIZED'
      }
    ]);
  }
}
