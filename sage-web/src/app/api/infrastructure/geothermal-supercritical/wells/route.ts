import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/geothermal-supercritical/wells', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Geothermal Supercritical wells:', error);
  }

  return NextResponse.json([
    {
      well_id: 'well-reykjanes-deep-01',
      name: 'Reykjanes Peninsula Deep Magma Well 01',
      depth_m: 5400,
      temp_c: 525.0,
      pressure_bar: 250.0,
      output_mw: 195.0,
      status: 'SUPERCRITICAL_FLOWING',
    },
    {
      well_id: 'well-krafla-magma-02',
      name: 'Krafla Supercritical Volcanic Tap 02',
      depth_m: 5100,
      temp_c: 508.0,
      pressure_bar: 242.0,
      output_mw: 185.0,
      status: 'SUPERCRITICAL_FLOWING',
    },
    {
      well_id: 'well-new-berry-caldera-03',
      name: 'Newberry Caldera Super-Hot EGS Well 03',
      depth_m: 5300,
      temp_c: 518.0,
      pressure_bar: 246.0,
      output_mw: 190.0,
      status: 'SUPERCRITICAL_FLOWING',
    },
    {
      well_id: 'well-taupo-volcanic-04',
      name: 'Taupo Volcanic Supercritical Well 04',
      depth_m: 5000,
      temp_c: 498.0,
      pressure_bar: 238.0,
      output_mw: 170.0,
      status: 'SUPERCRITICAL_FLOWING',
    },
  ]);
}
