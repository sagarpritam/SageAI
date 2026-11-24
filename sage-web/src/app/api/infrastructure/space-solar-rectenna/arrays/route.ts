import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/space-solar-rectenna/arrays', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Space Solar Rectenna arrays:', error);
  }

  return NextResponse.json([
    {
      array_id: 'rectenna-mojave-alpha',
      name: 'Mojave Desert Terrestrial Rectenna Array Alpha',
      surface_area_sq_km: 18.5,
      reception_capacity_gw: 3.2,
      current_output_gw: 2.95,
      diode_conversion_efficiency_pct: 85.2,
      grid_intertie: 'Western Electricity Coordinating Council (WECC) 500kV',
      status: 'BEAM_LOCKED_NOMINAL',
    },
    {
      array_id: 'rectenna-atacama-beta',
      name: 'Atacama High-Plateau Microwave Collector Beta',
      surface_area_sq_km: 15.0,
      reception_capacity_gw: 2.8,
      current_output_gw: 2.65,
      diode_conversion_efficiency_pct: 86.0,
      grid_intertie: 'Chilean Central Interconnected Supergrid (SIC)',
      status: 'BEAM_LOCKED_NOMINAL',
    },
    {
      array_id: 'rectenna-pilbara-gamma',
      name: 'Western Australian Desert Ground Array Gamma',
      surface_area_sq_km: 16.4,
      reception_capacity_gw: 2.5,
      current_output_gw: 2.38,
      diode_conversion_efficiency_pct: 84.1,
      grid_intertie: 'North West Interconnected System (NWIS)',
      status: 'BEAM_LOCKED_NOMINAL',
    },
    {
      array_id: 'rectenna-sahara-delta',
      name: 'Sahara Sub-Equatorial Rectenna Station Delta',
      surface_area_sq_km: 20.0,
      reception_capacity_gw: 3.5,
      current_output_gw: 3.22,
      diode_conversion_efficiency_pct: 84.9,
      grid_intertie: 'North African Pan-Arab HVDC Interconnector',
      status: 'BEAM_LOCKED_NOMINAL',
    },
  ]);
}
