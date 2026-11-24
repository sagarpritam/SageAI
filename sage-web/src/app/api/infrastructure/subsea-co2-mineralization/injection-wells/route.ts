import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/subsea-co2-mineralization/injection-wells', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Subsea CO2 Mineralization injection wells:', error);
  }

  return NextResponse.json([
    {
      well_id: 'wellhead-reykjanes-ridge-01',
      name: 'Reykjanes Ridge Offshore Basalt Well 01',
      location: 'North Atlantic Mid-Ocean Ridge',
      depth_m: 2400,
      flow_rate_t_per_h: 650.0,
      mineralization_pct: 98.4,
      seismic_risk: 'NEGLIGIBLE_MICROSEISMIC_STABLE',
      status: 'INJECTION_ONLINE',
    },
    {
      well_id: 'wellhead-juan-de-fuca-02',
      name: 'Cascadia Subsea Basalt Complex 02',
      location: 'Juan de Fuca Plate, Pacific Ocean',
      depth_m: 2800,
      flow_rate_t_per_h: 580.0,
      mineralization_pct: 97.9,
      seismic_risk: 'NEGLIGIBLE_MICROSEISMIC_STABLE',
      status: 'INJECTION_ONLINE',
    },
    {
      well_id: 'wellhead-north-sea-viking-03',
      name: 'Viking Graben Offshore Carbon Sink 03',
      location: 'North Sea Basalt Horizon',
      depth_m: 2100,
      flow_rate_t_per_h: 490.0,
      mineralization_pct: 98.1,
      seismic_risk: 'NEGLIGIBLE_MICROSEISMIC_STABLE',
      status: 'INJECTION_ONLINE',
    },
    {
      well_id: 'wellhead-tasman-basin-04',
      name: 'Lord Howe Submarine Volcanic Plateau 04',
      location: 'Tasman Sea Basin, Australia',
      depth_m: 2600,
      flow_rate_t_per_h: 420.0,
      mineralization_pct: 97.5,
      seismic_risk: 'NEGLIGIBLE_MICROSEISMIC_STABLE',
      status: 'INJECTION_ONLINE',
    },
  ]);
}
