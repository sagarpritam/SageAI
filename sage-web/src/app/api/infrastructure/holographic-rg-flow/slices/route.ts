import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/holographic-rg-flow/slices', {
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
        slice_id: 'HRGF-SLICE-UV-BOUNDARY',
        slice_depth_z_coordinate: 0.001,
        dilaton_field_phi: 0.042,
        metric_warp_factor_a_z: 1000.0,
        central_charge_c: 128.5,
        rg_flow_energy_scale_gev: 1.0e19,
        status: 'CONFORMAL_UV_FIXED'
      },
      {
        slice_id: 'HRGF-SLICE-INTERMEDIATE-ALPHA',
        slice_depth_z_coordinate: 0.250,
        dilaton_field_phi: 0.385,
        metric_warp_factor_a_z: 4.0,
        central_charge_c: 112.4,
        rg_flow_energy_scale_gev: 2.5e15,
        status: 'RUNNING_DILATON_STABLE'
      },
      {
        slice_id: 'HRGF-SLICE-INTERMEDIATE-BETA',
        slice_depth_z_coordinate: 0.650,
        dilaton_field_phi: 0.892,
        metric_warp_factor_a_z: 1.538,
        central_charge_c: 98.7,
        rg_flow_energy_scale_gev: 5.0e9,
        status: 'RUNNING_DILATON_STABLE'
      },
      {
        slice_id: 'HRGF-SLICE-IR-HORIZON',
        slice_depth_z_coordinate: 1.000,
        dilaton_field_phi: 1.414,
        metric_warp_factor_a_z: 1.0,
        central_charge_c: 86.7,
        rg_flow_energy_scale_gev: 1.0e2,
        status: 'IR_CONFINED_STABLE'
      }
    ]);
  }
}
