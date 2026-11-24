import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/wormhole-transit/gates', {
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
        gate_id: 'gate-sol-centauri-nexus-01',
        name: 'Sol-Alpha Centauri Transit Gate Alpha',
        endpoint_coordinates: 'Alpha Centauri A Barycenter (4.37 ly)',
        throat_radius_m: 225.0,
        mass_capacity_megatons_sec: 1200.0,
        casimir_flux_density_pj: 850.0,
        status: 'GATE_OPEN_TRANSIT_PERMITTED'
      },
      {
        gate_id: 'gate-sol-bernard-corridor-02',
        name: 'Barnard Star Sub-Light Bypass Gateway',
        endpoint_coordinates: 'Barnard Star Orbital Perihelion (5.96 ly)',
        throat_radius_m: 200.0,
        mass_capacity_megatons_sec: 950.0,
        casimir_flux_density_pj: 720.0,
        status: 'GATE_OPEN_TRANSIT_PERMITTED'
      },
      {
        gate_id: 'gate-sol-sirius-transit-03',
        name: 'Sirius Interstellar Macro-Corridor Terminal',
        endpoint_coordinates: 'Sirius A Lagrange L4 Point (8.60 ly)',
        throat_radius_m: 250.0,
        mass_capacity_megatons_sec: 1500.0,
        casimir_flux_density_pj: 980.0,
        status: 'GATE_OPEN_TRANSIT_PERMITTED'
      },
      {
        gate_id: 'gate-sol-ross128-express-04',
        name: 'Ross 128 Fast Cargo Ingress Funnel',
        endpoint_coordinates: 'Ross 128 Polar Anchor (11.03 ly)',
        throat_radius_m: 180.0,
        mass_capacity_megatons_sec: 800.0,
        casimir_flux_density_pj: 640.0,
        status: 'CHRONOLOGY_PROTECTION_LOCKED'
      }
    ]);
  }
}
