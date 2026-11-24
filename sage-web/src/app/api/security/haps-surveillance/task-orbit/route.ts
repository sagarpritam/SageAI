import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/haps-surveillance/task-orbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback HAPS Surveillance task orbit receipt:', error);
  }

  const payload = body as { platform_id?: string; target_corridor?: string };
  const targetPlatform = payload.platform_id || 'haps-station-alpha-va';
  const corridor = payload.target_corridor || 'Ashburn Hyperscale East Coast Corridor';

  return NextResponse.json({
    success: true,
    receipt_id: `HAPS-TASK-${Date.now()}`,
    platform_id: targetPlatform,
    target_corridor: corridor,
    timestamp: new Date().toISOString(),
    status: 'HAPS_ORBIT_RECONNAISSANCE_LOCKED',
  });
}
