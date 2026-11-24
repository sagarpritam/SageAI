import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/photonic-topological-qkd/waveguides', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Photonic Topological QKD waveguides:', error);
  }

  return NextResponse.json([
    {
      waveguide_id: 'topo-guide-london-dc-01',
      name: 'London Financial Core Topological Interconnect 01',
      location: 'City of London - Canary Wharf',
      length_km: 18.5,
      key_rate_gbps: 42.0,
      qber_pct: 0.38,
      chern_number: 1,
      status: 'PHASE_PROTECTED',
    },
    {
      waveguide_id: 'topo-guide-nyse-sec-02',
      name: 'Wall Street Topological Quantum Corridor 02',
      location: 'Manhattan - Mahwah Ring',
      length_km: 34.0,
      key_rate_gbps: 40.5,
      qber_pct: 0.41,
      chern_number: 1,
      status: 'PHASE_PROTECTED',
    },
    {
      waveguide_id: 'topo-guide-tokyo-fin-03',
      name: 'Otemachi-Nihonbashi Valley Edge Loop 03',
      location: 'Tokyo Central Metro Hub',
      length_km: 12.0,
      key_rate_gbps: 44.0,
      qber_pct: 0.35,
      chern_number: 1,
      status: 'PHASE_PROTECTED',
    },
    {
      waveguide_id: 'topo-guide-frankfurt-ecb-04',
      name: 'Frankfurt Sovereign Inter-Bank Photonic Ring 04',
      location: 'DE-CIX - Ostend Corridor',
      length_km: 22.0,
      key_rate_gbps: 39.5,
      qber_pct: 0.44,
      chern_number: 1,
      status: 'PHASE_PROTECTED',
    },
  ]);
}
