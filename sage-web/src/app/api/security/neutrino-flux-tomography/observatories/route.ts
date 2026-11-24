import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/neutrino-flux-tomography/observatories', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Neutrino Flux Tomography observatories:', error);
  }

  return NextResponse.json([
    {
      obs_id: 'neutrino-obs-gran-sasso-01',
      name: 'Laboratori Nazionali del Gran Sasso Core',
      location: "L'Aquila, Abruzzo, Italy",
      depth_mwe: 3800,
      scintillator_mass_kt: 30.0,
      background_rejection_pct: 99.98,
      status: 'DETECTION_COHERENT',
    },
    {
      obs_id: 'neutrino-obs-kamioka-02',
      name: 'Super-Kamioka Deep Basalt Array',
      location: 'Hida, Gifu Prefecture, Japan',
      depth_mwe: 2700,
      scintillator_mass_kt: 50.0,
      background_rejection_pct: 99.96,
      status: 'DETECTION_COHERENT',
    },
    {
      obs_id: 'neutrino-obs-snolab-vale-03',
      name: 'SNOLAB Deep Nickel Basin Detector',
      location: 'Sudbury, Ontario, Canada',
      depth_mwe: 6000,
      scintillator_mass_kt: 40.0,
      background_rejection_pct: 99.99,
      status: 'DETECTION_COHERENT',
    },
    {
      obs_id: 'neutrino-obs-juno-jiangmen-04',
      name: 'Jiangmen Underground Neutrino Observatory',
      location: 'Kaiping, Guangdong, China',
      depth_mwe: 1800,
      scintillator_mass_kt: 30.0,
      background_rejection_pct: 99.95,
      status: 'DETECTION_COHERENT',
    },
  ]);
}
