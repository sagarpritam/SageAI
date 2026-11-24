import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/space-solar-rectenna/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Space Solar Rectenna telemetry:', error);
  }

  return NextResponse.json({
    grid_id: 'sbsp-microwave-rectenna-mesh-01',
    status: 'GEOSTATIONARY_MICROWAVE_DOWNLINK_LOCKED',
    orbital_solar_capacity_gw: 12.5,
    downlink_frequency_ghz: 5.8,
    phased_array_aperture_km: 1.2,
    rectenna_ground_conversion_efficiency_pct: 84.6,
    atmospheric_penetration_loss_pct: 1.8,
    delivered_terrestrial_power_gw: 10.2,
    active_rectenna_farms: 8,
    last_beam_steering_timestamp: new Date().toISOString(),
  });
}
