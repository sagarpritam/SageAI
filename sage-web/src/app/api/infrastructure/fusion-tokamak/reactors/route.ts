import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/fusion-tokamak/reactors', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Fusion Tokamak reactors:', error);
  }

  return NextResponse.json([
    {
      reactor_id: 'reactor-torus-alpha-01',
      name: 'SPARC-Class High-Field Magnet Torus 01',
      core_temp_m_c: 146.2,
      toroidal_field_tesla: 13.6,
      fusion_q_gain: 14.5,
      net_output_mw: 130.0,
      tritium_breeding_ratio: 1.15,
      status: 'BURNING_PLASMA_LOCKED',
    },
    {
      reactor_id: 'reactor-torus-bravo-02',
      name: 'Advanced Divertor Toroidal Core 02',
      core_temp_m_c: 144.8,
      toroidal_field_tesla: 13.5,
      fusion_q_gain: 14.2,
      net_output_mw: 130.0,
      tritium_breeding_ratio: 1.14,
      status: 'BURNING_PLASMA_LOCKED',
    },
    {
      reactor_id: 'reactor-torus-charlie-03',
      name: 'Negative Triangularity Tokamak 03',
      core_temp_m_c: 143.9,
      toroidal_field_tesla: 13.4,
      fusion_q_gain: 14.0,
      net_output_mw: 130.0,
      tritium_breeding_ratio: 1.12,
      status: 'BURNING_PLASMA_LOCKED',
    },
    {
      reactor_id: 'reactor-torus-delta-04',
      name: 'Direct Magnetohydrodynamic Tap 04',
      core_temp_m_c: 145.1,
      toroidal_field_tesla: 13.5,
      fusion_q_gain: 14.1,
      net_output_mw: 130.0,
      tritium_breeding_ratio: 1.13,
      status: 'BURNING_PLASMA_LOCKED',
    },
  ]);
}
