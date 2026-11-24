import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stellarator-hypergrid/coils', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Stellarator Hypergrid coils:', error);
  }

  return NextResponse.json([
    {
      coil_id: 'coil-modular-twist-alpha',
      name: 'Superconducting 3D Modular Twist Coil Alpha',
      current_density_ma_per_sq_m: 145.0,
      magnetic_field_tesla: 16.8,
      quench_margin_kelvin: 4.5,
      coolant: 'Supercritical Liquid Helium (4.2K)',
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      coil_id: 'coil-tf-trim-beta',
      name: 'Toroidal Field Trimming Coil Beta',
      current_density_ma_per_sq_m: 138.0,
      magnetic_field_tesla: 15.9,
      quench_margin_kelvin: 4.8,
      coolant: 'Supercritical Liquid Helium (4.2K)',
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      coil_id: 'coil-divertor-shaping-gamma',
      name: 'Poloidal Divertor Shaping Coil Gamma',
      current_density_ma_per_sq_m: 152.0,
      magnetic_field_tesla: 16.5,
      quench_margin_kelvin: 4.2,
      coolant: 'Supercritical Liquid Helium (4.2K)',
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      coil_id: 'coil-mirror-nonplanar-delta',
      name: 'Cryogenic Non-Planar Mirror Coil Delta',
      current_density_ma_per_sq_m: 142.0,
      magnetic_field_tesla: 16.1,
      quench_margin_kelvin: 4.6,
      coolant: 'Supercritical Liquid Helium (4.2K)',
      status: 'SUPERCONDUCTING_LOCKED',
    },
  ]);
}
