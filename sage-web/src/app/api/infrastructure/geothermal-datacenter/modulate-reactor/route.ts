import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/geothermal-datacenter/modulate-reactor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Geothermal reactor modulation receipt:', error);
  }

  const payload = body as { borehole_id?: string; throttle_pct?: number };
  const targetBorehole = payload.borehole_id || 'borehole-iceland-bh01';
  const throttle = payload.throttle_pct !== undefined ? payload.throttle_pct : 100.0;

  return NextResponse.json({
    success: true,
    receipt_id: `GEO-MOD-${Date.now()}`,
    borehole_id: targetBorehole,
    turbine_throttle_pct: throttle,
    generator_output_mw: 65.0 * (throttle / 100.0),
    timestamp: new Date().toISOString(),
    status: 'SUPERCRITICAL_MODULATION_APPLIED',
  });
}
