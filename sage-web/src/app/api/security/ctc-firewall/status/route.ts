import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/ctc-firewall/status', {
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
      firewall_id: 'CTC-FIREWALL-HAWKING-01',
      chronology_protection_index_pct: 99.9999,
      stress_energy_divergence_gev4: 8.45e32,
      active_cauchy_horizons_monitored: 16,
      sub_planckian_damping_arrays: 4,
      causality_violation_quench_rate_pct: 99.995,
      last_interception_timestamp: new Date().toISOString()
    });
  }
}
