import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/magnetocaloric-cryo/stages', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Magnetocaloric Cryo stages:', error);
  }

  return NextResponse.json([
    {
      stage_id: 'cadr-stage-4k-pulse',
      name: 'Pulse-Tube Precooling Stage (4.2 K)',
      temp_k: 4.2,
      magnetic_field_t: 0.0,
      cooling_power_w: 1.5,
      status: 'STAGE_COOLED',
    },
    {
      stage_id: 'cadr-stage-1k-ggg',
      name: 'First CADR GGG Stage (0.85 K)',
      temp_k: 0.85,
      magnetic_field_t: 3.2,
      cooling_power_w: 0.025,
      status: 'STAGE_COOLED',
    },
    {
      stage_id: 'cadr-stage-300mk-dgg',
      name: 'Second CADR DGG Stage (280 mK)',
      temp_k: 0.28,
      magnetic_field_t: 4.5,
      cooling_power_w: 0.00045,
      status: 'STAGE_COOLED',
    },
    {
      stage_id: 'cadr-stage-15mk-faa',
      name: 'Final Salt-Pill FAA Stage (15 mK)',
      temp_k: 0.015,
      magnetic_field_t: 5.8,
      cooling_power_w: 0.00012,
      status: 'STAGE_COOLED',
    },
  ]);
}
