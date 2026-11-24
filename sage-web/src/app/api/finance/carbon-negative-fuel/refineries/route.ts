import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/carbon-negative-fuel/refineries', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Carbon Negative Fuel refineries:', error);
  }

  return NextResponse.json([
    {
      refinery_id: 'dac-refinery-reykjavik',
      name: 'Reykjavik Geothermal DAC SynFuel Plant 01',
      fuel_grade: 'Sustainable Aviation Fuel (e-Jet A-1)',
      daily_output_barrels: 12000.0,
      co2_capture_source: 'Climeworks Direct Air Mineralization',
      h2_source: 'Geothermal Steam Electrolysis',
      carbon_intensity_gco2e: -28.5,
      status: 'CONTINUOUS_SYNTHESIS_ACTIVE',
    },
    {
      refinery_id: 'dac-refinery-neom',
      name: 'Neom Clean Hydrogen Synthetic Kerosene Complex',
      fuel_grade: 'Military-Grade Synthetic Kerosene (JP-8/e-Fuel)',
      daily_output_barrels: 15000.0,
      co2_capture_source: 'Red Sea Coastal Direct Air Capture Array',
      h2_source: 'Solar-Wind 4GW Electrolyzer Hub',
      carbon_intensity_gco2e: -25.2,
      status: 'CONTINUOUS_SYNTHESIS_ACTIVE',
    },
    {
      refinery_id: 'dac-refinery-permian',
      name: 'Texas Permian Direct Air Hydrocarbon Synthesis Hub',
      fuel_grade: 'Zero-Emission Synthetic Naphtha & Jet Fuel',
      daily_output_barrels: 10000.0,
      co2_capture_source: 'Oxy 1PointFive DAC Megaplant',
      h2_source: 'Nuclear SMR Water Splitting',
      carbon_intensity_gco2e: -22.4,
      status: 'CONTINUOUS_SYNTHESIS_ACTIVE',
    },
    {
      refinery_id: 'dac-refinery-pilbara',
      name: 'Pilbara Solar Synthetic Jet A-1 Facility',
      fuel_grade: 'Commercial Aviation Bio-Equivalent SynFuel',
      daily_output_barrels: 8000.0,
      co2_capture_source: 'Arid Ambient Direct Air Sorption',
      h2_source: 'Pilbara Ultra-Scale Solar PV Farms',
      carbon_intensity_gco2e: -23.1,
      status: 'CONTINUOUS_SYNTHESIS_ACTIVE',
    },
  ]);
}
