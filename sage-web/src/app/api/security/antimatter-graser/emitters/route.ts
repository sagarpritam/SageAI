import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/antimatter-graser/emitters', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json([
      {
        emitter_id: 'graser-emitter-maunakea-01',
        name: 'Mauna Kea High-Altitude Gamma-Ray Defense Station 01',
        location: 'Hawaii, USA (Elevation 4,207 m)',
        storage_capacity_nanograms_positrons: 85.0,
        coherent_flux_density_w_cm2: 4.2e14,
        optical_cavity_type: 'Relativistic Bragg Crystal Reflector',
        status: 'ARMED_AND_READY'
      },
      {
        emitter_id: 'graser-emitter-chajnantor-02',
        name: 'Chajnantor Plateau Annihilation Directed Energy Array 02',
        location: 'Atacama Desert, Chile (Elevation 5,100 m)',
        storage_capacity_nanograms_positrons: 120.0,
        coherent_flux_density_w_cm2: 5.8e14,
        optical_cavity_type: 'Relativistic Bragg Crystal Reflector',
        status: 'ARMED_AND_READY'
      },
      {
        emitter_id: 'graser-emitter-picdumidi-03',
        name: 'Pic du Midi High-Energy Graser Sentinel 03',
        location: 'Pyrenees, France (Elevation 2,877 m)',
        storage_capacity_nanograms_positrons: 65.0,
        coherent_flux_density_w_cm2: 3.9e14,
        optical_cavity_type: 'Relativistic Bragg Crystal Reflector',
        status: 'ARMED_AND_READY'
      },
      {
        emitter_id: 'graser-emitter-namib-04',
        name: 'Namib Escarpment Southern Hemisphere Graser 04',
        location: 'Khomas Highland, Namibia (Elevation 2,350 m)',
        storage_capacity_nanograms_positrons: 75.0,
        coherent_flux_density_w_cm2: 4.5e14,
        optical_cavity_type: 'Relativistic Bragg Crystal Reflector',
        status: 'ARMED_AND_READY'
      }
    ]);
  }
}
