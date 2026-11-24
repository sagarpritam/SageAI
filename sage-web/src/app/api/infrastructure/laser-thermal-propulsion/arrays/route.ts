import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/laser-thermal-propulsion/arrays', {
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
        array_id: 'laser-array-atacama-01',
        name: 'Atacama Giga-Phased Laser Propulsion Terminal 01',
        location: 'Atacama Basin, Chile (Elevation 4,800 m)',
        beamed_power_gw: 3.2,
        emitter_elements_count: 64000,
        target_leo_inclination_deg: 28.5,
        status: 'BEAM_TRANSMISSION_READY'
      },
      {
        array_id: 'laser-array-lakegairdner-02',
        name: 'Lake Gairdner Equatorial Ascent Beam Array 02',
        location: 'South Australia Outback',
        beamed_power_gw: 2.5,
        emitter_elements_count: 48000,
        target_leo_inclination_deg: 32.0,
        status: 'BEAM_TRANSMISSION_READY'
      },
      {
        array_id: 'laser-array-mojave-03',
        name: 'Mojave Deep Basin Optical Thermal Highway 03',
        location: 'Mojave Desert, California, USA',
        beamed_power_gw: 1.8,
        emitter_elements_count: 36000,
        target_leo_inclination_deg: 51.6,
        status: 'BEAM_TRANSMISSION_READY'
      },
      {
        array_id: 'laser-array-tenerife-04',
        name: 'Teide High-Altitude Atmospheric Beam Director 04',
        location: 'Tenerife, Canary Islands, Spain',
        beamed_power_gw: 1.0,
        emitter_elements_count: 20000,
        target_leo_inclination_deg: 28.0,
        status: 'BEAM_TRANSMISSION_READY'
      }
    ]);
  }
}
