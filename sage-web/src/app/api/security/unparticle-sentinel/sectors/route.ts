import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/unparticle-sentinel/sectors', {
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
        sector_id: 'USIS-SECTOR-BANKS-ZAKS-01',
        sector_name: 'Banks-Zaks Infrared Fixed Point Perimeter',
        operator_conformal_spin: 0,
        propagator_phase_angle_rad: 1.099,
        missing_energy_flux_gev: 0.012,
        quench_latency_picoseconds: 4.2,
        status: 'CONFORMALLY_SHIELDED'
      },
      {
        sector_id: 'USIS-SECTOR-GEORGI-VECTOR-02',
        sector_name: 'Georgi Vector Current Ingress Interceptor',
        operator_conformal_spin: 1,
        propagator_phase_angle_rad: 1.099,
        missing_energy_flux_gev: 0.008,
        quench_latency_picoseconds: 3.8,
        status: 'CONFORMALLY_SHIELDED'
      },
      {
        sector_id: 'USIS-SECTOR-SCALAR-CONTINUUM-03',
        sector_name: 'Fractional Scalar Continuum Sensor',
        operator_conformal_spin: 0,
        propagator_phase_angle_rad: 1.099,
        missing_energy_flux_gev: 0.015,
        quench_latency_picoseconds: 4.5,
        status: 'CONFORMALLY_SHIELDED'
      },
      {
        sector_id: 'USIS-SECTOR-TENSOR-METRIC-04',
        sector_name: 'Rank-2 Tensor Energy-Momentum Sentinel',
        operator_conformal_spin: 2,
        propagator_phase_angle_rad: 1.099,
        missing_energy_flux_gev: 0.005,
        quench_latency_picoseconds: 3.2,
        status: 'CONFORMALLY_SHIELDED'
      }
    ]);
  }
}
