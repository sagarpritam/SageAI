import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/matrioshka-brain/shells', {
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
        shell_id: 'shell-tier-1-inner',
        name: 'Shell Alpha (Inner High-Temp Radiator)',
        radius_au: 0.65,
        operating_temp_kelvin: 320.0,
        computational_capacity_flops: 6.5e41,
        cooling_gradient_kelvin: 140.0,
        status: 'COMPUTE_TIER_OPTIMAL'
      },
      {
        shell_id: 'shell-tier-2-mid',
        name: 'Shell Beta (Mid-Temperature Optical Core)',
        radius_au: 1.45,
        operating_temp_kelvin: 180.0,
        computational_capacity_flops: 4.5e41,
        cooling_gradient_kelvin: 90.0,
        status: 'COMPUTE_TIER_OPTIMAL'
      },
      {
        shell_id: 'shell-tier-3-outer',
        name: 'Shell Gamma (Cryo-Optical Sub-System)',
        radius_au: 3.20,
        operating_temp_kelvin: 70.0,
        computational_capacity_flops: 2.2e41,
        cooling_gradient_kelvin: 40.0,
        status: 'COMPUTE_TIER_OPTIMAL'
      },
      {
        shell_id: 'shell-tier-4-abyssal',
        name: 'Shell Delta (Deep-Space Cold Reservoir)',
        radius_au: 6.80,
        operating_temp_kelvin: 30.0,
        computational_capacity_flops: 8.0e40,
        cooling_gradient_kelvin: 12.0,
        status: 'ZERO_ENTROPY_EXPANSION'
      }
    ]);
  }
}
