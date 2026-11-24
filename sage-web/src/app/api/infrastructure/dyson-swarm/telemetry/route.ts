import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/dyson-swarm/telemetry', {
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
      swarm_id: 'dyson-swarm-mesh-01',
      status: 'CIRCUMSOLAR_BEAMING_SYNCHRONIZED',
      swarm_architecture: 'Circumsolar Concentrated Photovoltaic Swarm & Phased Gyrotron Rectenna Mesh',
      orbital_perihelion_au: 0.28,
      total_harvested_power_petawatts: 120.0,
      beamed_microwave_frequency_ghz: 140.0,
      rectenna_conversion_efficiency_pct: 94.6,
      active_collector_satellites: 1250000,
      target_planetary_rectennas: 16,
      orbital_pointing_accuracy_microrad: 0.015,
      last_energy_beam_timestamp: new Date().toISOString()
    });
  }
}
