import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/cat-bond-syndicate/bonds', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    console.error('Using fallback Cat Bonds list:', error);
  }

  return NextResponse.json([
    {
      bond_id: 'cat-bond-subsea-cut',
      peril_name: 'Transatlantic & Transpacific Subsea Fiber Rupture',
      principal_usd: 125000000.0,
      coupon_pct: 6.10,
      trigger_condition: '>= 3 Major Fiber Cuts in 24h Window',
      underwriting_lead: 'Swiss Re Capital Markets Syndicate',
      rating: 'A+',
      status: 'ARMED_ZERO_LOSS',
    },
    {
      bond_id: 'cat-bond-solar-flare',
      peril_name: 'G5 Extreme Geomagnetic Solar Storm Outage',
      principal_usd: 100000000.0,
      coupon_pct: 6.80,
      trigger_condition: 'Kp Index >= 9 with Grid Inverter Trip',
      underwriting_lead: 'Munich Re Digital Assets SPV',
      rating: 'AA-',
      status: 'ARMED_ZERO_LOSS',
    },
    {
      bond_id: 'cat-bond-seismic-quake',
      peril_name: 'Pacific Rim Hyperscale Datacenter Seismic Event',
      principal_usd: 75000000.0,
      coupon_pct: 5.90,
      trigger_condition: 'PGA >= 0.65g within 25km of Pods',
      underwriting_lead: 'Hannover Re Parametric Syndicate',
      rating: 'A',
      status: 'ARMED_ZERO_LOSS',
    },
    {
      bond_id: 'cat-bond-grid-blackout',
      peril_name: 'Regional Multicounty Grid Cascading Blackout',
      principal_usd: 50000000.0,
      coupon_pct: 6.20,
      trigger_condition: 'Synchronous Grid Failure > 48 Hours',
      underwriting_lead: "Lloyd's of London Cyber & Parametric SPV",
      rating: 'A+',
      status: 'ARMED_ZERO_LOSS',
    },
  ]);
}
