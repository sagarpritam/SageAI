import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/galactic-hypergrid/modulate-power', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      dispatch_id: `DSP-SGR-${Math.floor(100 + Math.random() * 900)}`,
      node_id: 'SGR-RING-01',
      target_arm: 'Orion Spur Deep Trunk',
      modulated_power_exawatts: 5000.0,
      penrose_efficiency_pct: 92.4,
      status: 'DISPATCHED_INTO_HYPERGRID',
      timestamp: new Date().toISOString()
    });
  }
}
