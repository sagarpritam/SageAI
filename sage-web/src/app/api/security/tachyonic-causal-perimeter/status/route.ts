import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/tachyonic-causal-perimeter/status', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      perimeter_id: 'TCP-MILKYWAY-CORE-SEC',
      causal_consistency_index_pct: 99.9998,
      superluminal_detection_latency_ps: 0.014,
      active_detector_arrays: 4,
      monitored_ctc_hotspots: 12,
      chronoclasm_dampening_readiness_pct: 99.96,
      last_incident_timestamp: new Date().toISOString()
    });
  }
}
