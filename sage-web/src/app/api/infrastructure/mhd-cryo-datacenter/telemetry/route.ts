import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/mhd-cryo-datacenter/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback MHD Cryo Datacenter telemetry:', error);
  }

  return NextResponse.json({
    datacenter_id: 'mhd-subsea-cryo-cluster-01',
    status: 'ABYSSAL_MHD_CRYO_EQUILIBRIUM',
    ocean_depth_m: 3200.0,
    ambient_seawater_temp_c: 1.8,
    cryo_coolant_temp_c: -42.5,
    mhd_pump_magnetic_field_tesla: 8.5,
    seawater_volumetric_flow_m3_s: 1450.0,
    total_compute_capacity_mw: 180.0,
    cooling_pue: 1.012,
    moving_mechanical_parts: 0,
    acoustic_stealth_db: 14.2,
    last_modulation_timestamp: new Date().toISOString(),
  });
}
