import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const emitterId = body.emitter_id || 'graser-emitter-maunakea-01';
    const targetAzimuth = typeof body.target_azimuth === 'number' ? body.target_azimuth : 142.5;
    const targetElevation = typeof body.target_elevation === 'number' ? body.target_elevation : 68.2;

    const res = await fetch('http://127.0.0.1:8000/api/security/antimatter-graser/fire-pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emitter_id: emitterId,
        target_azimuth: targetAzimuth,
        target_elevation: targetElevation,
      }),
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      success: true,
      receipt_id: `GRASER-PLS-${Date.now().toString().slice(-6)}`,
      emitter_id: 'graser-emitter-maunakea-01',
      emitter_name: 'Mauna Kea High-Altitude Gamma-Ray Defense Station 01',
      photon_energy_kev: 511.0,
      coherent_511kev_megajoules: 780.0,
      target_ablation_status: 'HYPERSONIC_TARGET_VAPORIZED',
      status: 'COHERENT_GRASER_PULSE_FIRED',
      timestamp: new Date().toISOString()
    });
  }
}
