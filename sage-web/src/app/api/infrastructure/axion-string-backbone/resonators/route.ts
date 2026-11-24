import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/axion-string-backbone/resonators', {
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
        resonator_id: 'ASNB-RES-KIBBLE-ALPHA',
        resonator_name: 'Kibble Cosmic Loop Ingress Hub',
        string_curvature_radius_au: 142.5,
        domain_wall_surface_tension_mev3: 4.8e9,
        resonant_frequency_ghz: 240.5,
        channel_capacity_tbps: 250000.0,
        status: 'TOPOLOGICAL_SUPERLUMINAL_LOCKED'
      },
      {
        resonator_id: 'ASNB-RES-VILENKIN-BETA',
        resonator_name: 'Vilenkin Cuspidal Emission Relay',
        string_curvature_radius_au: 98.2,
        domain_wall_surface_tension_mev3: 4.8e9,
        resonant_frequency_ghz: 310.2,
        channel_capacity_tbps: 250000.0,
        status: 'TOPOLOGICAL_SUPERLUMINAL_LOCKED'
      },
      {
        resonator_id: 'ASNB-RES-HIKOSAKA-GAMMA',
        resonator_name: 'Hikosaka Inter-Cluster Bridging Node',
        string_curvature_radius_au: 320.0,
        domain_wall_surface_tension_mev3: 4.8e9,
        resonant_frequency_ghz: 185.0,
        channel_capacity_tbps: 250000.0,
        status: 'TOPOLOGICAL_SUPERLUMINAL_LOCKED'
      },
      {
        resonator_id: 'ASNB-RES-SIKIVIE-DELTA',
        resonator_name: 'Sikivie Cavity Primakoff Core',
        string_curvature_radius_au: 54.0,
        domain_wall_surface_tension_mev3: 4.8e9,
        resonant_frequency_ghz: 450.0,
        channel_capacity_tbps: 250000.0,
        status: 'TOPOLOGICAL_SUPERLUMINAL_LOCKED'
      }
    ]);
  }
}
