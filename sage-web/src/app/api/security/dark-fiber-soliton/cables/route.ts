import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/dark-fiber-soliton/cables', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Dark Fiber Soliton cables:', error);
  }

  return NextResponse.json([
    {
      cable_id: 'cable-transpac-unity-01',
      name: 'Transpacific Soliton Express Unity 01',
      route: 'Tokyo to Los Angeles',
      length_km: 9600.0,
      throughput_tbps: 160.0,
      repeaters: 56,
      qber_pct: 0.72,
      status: 'SOLITON_LOCK_OPTIMAL',
    },
    {
      cable_id: 'cable-transat-apollo-02',
      name: 'Transatlantic Soliton Conduit Apollo 02',
      route: 'London to New York',
      length_km: 6800.0,
      throughput_tbps: 200.0,
      repeaters: 42,
      qber_pct: 0.68,
      status: 'SOLITON_LOCK_OPTIMAL',
    },
    {
      cable_id: 'cable-asia-pacific-ring-03',
      name: 'Asia-Pacific Dark Fiber Soliton Ring 03',
      route: 'Singapore to Sydney',
      length_km: 6300.0,
      throughput_tbps: 140.0,
      repeaters: 38,
      qber_pct: 0.75,
      status: 'SOLITON_LOCK_OPTIMAL',
    },
    {
      cable_id: 'cable-nordic-arctic-04',
      name: 'Nordic Arctic Cryo-Fiber Link 04',
      route: 'Reykjavik to Oslo',
      length_km: 1800.0,
      throughput_tbps: 300.0,
      repeaters: 8,
      qber_pct: 0.54,
      status: 'SOLITON_LOCK_OPTIMAL',
    },
  ]);
}
