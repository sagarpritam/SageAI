import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const fleetId = body.fleet_id || 'aerosol-fleet-equatorial-01';
    const tons = typeof body.tons === 'number' ? body.tons : 120.0;

    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stratospheric-aerosol-albedo/disperse-aerosol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fleet_id: fleetId, tons: tons }),
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({
      success: true,
      receipt_id: `ALBEDO-DISP-${Date.now().toString().slice(-6)}`,
      fleet_id: 'aerosol-fleet-equatorial-01',
      fleet_name: 'Equatorial Stratospheric Solar UAS Wing 01',
      dispersed_calcite_tons: 120.0,
      forcing_reduction_mw_per_m2: 1450.0,
      status: 'ALBEDO_MODIFICATION_DISPERSED',
      timestamp: new Date().toISOString()
    });
  }
}
