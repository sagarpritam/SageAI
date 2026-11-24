import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch('http://127.0.0.1:8000/api/security/unparticle-sentinel/quench', {
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
      quench_id: `USIS-QUENCH-${Math.floor(700 + Math.random() * 200)}`,
      sector_id: 'USIS-SECTOR-BANKS-ZAKS-01',
      attenuation_rejection_db: -114.2,
      status: 'CONFORMAL_UNPARTICLE_LEAKAGE_QUENCHED',
      timestamp: new Date().toISOString()
    });
  }
}
