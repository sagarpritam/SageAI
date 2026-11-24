import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/planetary-core-thermoelectric/rings', {
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
        ring_id: 'ring-moho-pacific-01',
        name: 'Pacific Rim Moho Induction Ring',
        location: 'Mariana Trench Abyssal Borehole',
        depth_km: 38.0,
        thermal_output_terawatts: 12.5,
        operating_temp_celsius: 2550.0,
        seebeck_coefficient_uv_k: 480.0,
        status: 'HARVESTING_CONTINUOUS'
      },
      {
        ring_id: 'ring-moho-atlantic-02',
        name: 'Mid-Atlantic Ridge Thermal Nexus',
        location: 'Azores Fracture Zone Borehole',
        depth_km: 32.0,
        thermal_output_terawatts: 11.0,
        operating_temp_celsius: 2400.0,
        seebeck_coefficient_uv_k: 465.0,
        status: 'HARVESTING_CONTINUOUS'
      },
      {
        ring_id: 'ring-moho-iceland-03',
        name: 'Iceland Hotspot Supercritical Ring',
        location: 'Reykjanes Ridge Borehole',
        depth_km: 34.0,
        thermal_output_terawatts: 11.5,
        operating_temp_celsius: 2480.0,
        seebeck_coefficient_uv_k: 475.0,
        status: 'HARVESTING_CONTINUOUS'
      },
      {
        ring_id: 'ring-moho-african-04',
        name: 'East African Rift Mantle Conduit',
        location: 'Afar Depression Deep Well',
        depth_km: 36.0,
        thermal_output_terawatts: 10.0,
        operating_temp_celsius: 2380.0,
        seebeck_coefficient_uv_k: 455.0,
        status: 'HARVESTING_CONTINUOUS'
      }
    ]);
  }
}
