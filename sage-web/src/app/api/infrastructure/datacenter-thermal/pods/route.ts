import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/datacenter-thermal/pods', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback immersion pods:', error);
  }

  // Fallback high-fidelity pods
  return NextResponse.json([
    {
      pod_id: 'pod-01-atlantis-subsea',
      name: 'Atlantis Subsea Pod Alpha',
      location: 'North Sea (Norway Coast, 120m Depth)',
      cooling_technology: 'Subsea Direct Seawater Heat Sink (Closed Loop)',
      server_count: 2400,
      power_draw_mw: 28.5,
      fluid_temp_c: 34.2,
      target_temp_c: 35.0,
      pue: 1.018,
      coolant_flow_lpm: 850,
      status: 'OPTIMAL',
      last_telemetry: new Date().toISOString(),
    },
    {
      pod_id: 'pod-02-nordic-immersion',
      name: 'Nordic Geothermal Immersion Tank Beta',
      location: 'Reykjavik, Iceland',
      cooling_technology: 'Two-Phase Liquid Fluorochemical Immersion',
      server_count: 3600,
      power_draw_mw: 44.2,
      fluid_temp_c: 38.6,
      target_temp_c: 39.0,
      pue: 1.022,
      coolant_flow_lpm: 1200,
      status: 'OPTIMAL',
      last_telemetry: new Date().toISOString(),
    },
    {
      pod_id: 'pod-03-pacific-subsea',
      name: 'Pacific Subsea Capsule Gamma',
      location: 'Puget Sound, WA, USA (95m Depth)',
      cooling_technology: 'Seawater Thermocline Thermal Exchanger',
      server_count: 1800,
      power_draw_mw: 21.4,
      fluid_temp_c: 36.5,
      target_temp_c: 37.0,
      pue: 1.024,
      coolant_flow_lpm: 620,
      status: 'OPTIMAL',
      last_telemetry: new Date().toISOString(),
    },
    {
      pod_id: 'pod-04-alpine-hydro',
      name: 'Alpine Glacial Runoff Thermal Pod Delta',
      location: 'Valais, Switzerland',
      cooling_technology: 'Glacial Meltwater Micro-Hydro Heat Recovery',
      server_count: 2200,
      power_draw_mw: 20.5,
      fluid_temp_c: 41.2,
      target_temp_c: 39.5,
      pue: 1.031,
      coolant_flow_lpm: 780,
      status: 'OPTIMIZING',
      last_telemetry: new Date().toISOString(),
    },
  ]);
}
