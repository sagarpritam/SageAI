import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/geothermal-datacenter/boreholes', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Geothermal Datacenter boreholes:', error);
  }

  return NextResponse.json([
    {
      borehole_id: 'borehole-iceland-bh01',
      name: 'Reykjanes Magma-Boundary Borehole #01',
      depth_m: 4820,
      flow_rate_kg_s: 85.4,
      wellhead_temp_c: 452.1,
      turbine_output_mw: 65.0,
      cooling_efficiency_cop: 14.8,
      status: 'CONTINUOUS_SUPERCRITICAL_STREAM',
    },
    {
      borehole_id: 'borehole-iceland-bh02',
      name: 'Hengill Volcanic Fracture Borehole #02',
      depth_m: 4750,
      flow_rate_kg_s: 82.1,
      wellhead_temp_c: 448.6,
      turbine_output_mw: 62.5,
      cooling_efficiency_cop: 14.5,
      status: 'CONTINUOUS_SUPERCRITICAL_STREAM',
    },
    {
      borehole_id: 'borehole-iceland-bh03',
      name: 'Krafla Caldera Superheated Borehole #03',
      depth_m: 4900,
      flow_rate_kg_s: 88.0,
      wellhead_temp_c: 454.2,
      turbine_output_mw: 67.5,
      cooling_efficiency_cop: 15.1,
      status: 'CONTINUOUS_SUPERCRITICAL_STREAM',
    },
    {
      borehole_id: 'borehole-iceland-bh04',
      name: 'Hellisheidi Basalt Deep Injection Borehole #04',
      depth_m: 4680,
      flow_rate_kg_s: 78.5,
      wellhead_temp_c: 445.0,
      turbine_output_mw: 55.0,
      cooling_efficiency_cop: 14.2,
      status: 'CONTINUOUS_SUPERCRITICAL_STREAM',
    },
  ]);
}
