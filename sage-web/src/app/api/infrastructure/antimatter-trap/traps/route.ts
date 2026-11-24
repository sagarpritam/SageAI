import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/antimatter-trap/traps', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Antimatter Traps list:', error);
  }

  return NextResponse.json([
    {
      trap_id: 'penning-trap-alpha-cern',
      name: 'CERN-Spec Ultra-High Vacuum Positron Reservoir',
      positron_inventory: 320000000000.0,
      magnetic_field_tesla: 10.2,
      electrode_potential_volts: 1200.0,
      cryo_temp_kelvin: 0.012,
      status: 'CONFINEMENT_STABLE',
    },
    {
      trap_id: 'penning-trap-beta-fermi',
      name: 'Fermilab Superconducting Quadrupole Trap Module',
      positron_inventory: 210000000000.0,
      magnetic_field_tesla: 9.8,
      electrode_potential_volts: 1150.0,
      cryo_temp_kelvin: 0.014,
      status: 'CONFINEMENT_STABLE',
    },
    {
      trap_id: 'penning-trap-gamma-kek',
      name: 'KEK Magnetic Mirror Micro-Fusion Injector',
      positron_inventory: 180000000000.0,
      magnetic_field_tesla: 9.2,
      electrode_potential_volts: 1100.0,
      cryo_temp_kelvin: 0.016,
      status: 'CONFINEMENT_STABLE',
    },
    {
      trap_id: 'penning-trap-delta-riken',
      name: 'RIKEN Cryogenic Antiproton-Positron Co-Trap',
      positron_inventory: 130000000000.0,
      magnetic_field_tesla: 9.0,
      electrode_potential_volts: 1080.0,
      cryo_temp_kelvin: 0.015,
      status: 'CONFINEMENT_STABLE',
    },
  ]);
}
