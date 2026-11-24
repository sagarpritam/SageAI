import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/mhd-cryo-datacenter/pods', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback MHD Cryo Datacenter pods:', error);
  }

  return NextResponse.json([
    {
      pod_id: 'pod-mhd-abyssal-01',
      name: 'Marianas Trench Deep Compute Pod 01',
      depth_m: 3250,
      compute_capacity_mw: 45.0,
      coolant_temp_c: -42.8,
      flow_rate_m3_s: 380.0,
      magnetic_field_t: 8.6,
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      pod_id: 'pod-mhd-abyssal-02',
      name: 'Kuril Trench Ocean-Floor Sink 02',
      depth_m: 3180,
      compute_capacity_mw: 45.0,
      coolant_temp_c: -42.4,
      flow_rate_m3_s: 360.0,
      magnetic_field_t: 8.5,
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      pod_id: 'pod-mhd-abyssal-03',
      name: 'Reykjanes Ridge Hydrothermal Pod 03',
      depth_m: 3050,
      compute_capacity_mw: 45.0,
      coolant_temp_c: -42.1,
      flow_rate_m3_s: 350.0,
      magnetic_field_t: 8.4,
      status: 'SUPERCONDUCTING_LOCKED',
    },
    {
      pod_id: 'pod-mhd-abyssal-04',
      name: 'Puerto Rico Trench Cryo-Vault 04',
      depth_m: 3320,
      compute_capacity_mw: 45.0,
      coolant_temp_c: -42.6,
      flow_rate_m3_s: 360.0,
      magnetic_field_t: 8.5,
      status: 'SUPERCONDUCTING_LOCKED',
    },
  ]);
}
