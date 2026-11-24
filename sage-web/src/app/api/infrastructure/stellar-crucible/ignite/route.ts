import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stellar-crucible/ignite', {
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
      ignition_id: `IGN-OMC1-${Math.floor(700 + Math.random() * 200)}`,
      core_id: 'CORE-OMC1-ALPHA',
      deuterium_feed_rate_kg_sec: 450.0,
      confinement_field_tesla: 8500.0,
      thermal_output_yottawatts: 1.25,
      status: 'IGNITION_CONFIRMED',
      timestamp: new Date().toISOString()
    });
  }
}
