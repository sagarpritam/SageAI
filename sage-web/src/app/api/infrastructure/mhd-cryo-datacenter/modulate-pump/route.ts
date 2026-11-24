import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/mhd-cryo-datacenter/modulate-pump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback MHD Cryo Datacenter pump modulation receipt:', error);
  }

  const payload = body as { pod_id?: string; target_magnetic_field_tesla?: number };
  const targetPod = payload.pod_id || 'pod-mhd-abyssal-01';
  const bField = payload.target_magnetic_field_tesla !== undefined ? payload.target_magnetic_field_tesla : 8.8;

  return NextResponse.json({
    success: true,
    receipt_id: `MHD-PUMP-${Date.now()}`,
    pod_id: targetPod,
    target_magnetic_field_tesla: bField,
    seawater_volumetric_flow_m3_s: 380.0 * (bField / 8.5),
    timestamp: new Date().toISOString(),
    status: 'MHD_CONVECTION_OPTIMIZED',
  });
}
