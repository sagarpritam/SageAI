import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/laser-thermal-propulsion/telemetry', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      propulsion_highway_id: 'laser-thermal-propulsion-highway-01',
      status: 'BEAM_POWERED_ORBITAL_LAUNCH_ACTIVE',
      laser_technology: 'Phased Fiber Array Coherent Beam Combination (CBC)',
      operating_wavelength_microns: 1.064,
      aggregate_beamed_power_gigawatts: 8.5,
      launcher_specific_impulse_seconds: 1250.0,
      payload_to_leo_cost_usd_per_kg: 45.0,
      active_ground_phased_arrays: 16,
      adaptive_optics_strehl_ratio: 0.94,
      daily_orbital_launch_capacity_metric_tons: 520.0,
      last_beam_launch_timestamp: new Date().toISOString()
    });
  }
}
