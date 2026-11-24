import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/orbital-space-elevator/climbers', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Orbital Space Elevator climbers:', error);
  }

  return NextResponse.json([
    {
      climber_id: 'climber-maglev-hyperion-01',
      name: 'Hyperion Heavy Cargo MagLev Climber 01',
      altitude_km: 12500.0,
      payload_tons: 85.0,
      power_transmission: 'Free-Electron Laser Wireless Beaming',
      velocity_kmh: 450.0,
      status: 'CLIMBING_NOMINAL',
    },
    {
      climber_id: 'climber-maglev-chronos-02',
      name: 'Chronos Geosynchronous Transit Pod 02',
      altitude_km: 31000.0,
      payload_tons: 70.0,
      power_transmission: 'Free-Electron Laser Wireless Beaming',
      velocity_kmh: 420.0,
      status: 'CLIMBING_NOMINAL',
    },
    {
      climber_id: 'climber-maglev-selene-03',
      name: 'Selene Fuel & Cryo Tanker Car 03',
      altitude_km: 4200.0,
      payload_tons: 100.0,
      power_transmission: 'Inductive Superconducting Guide Rail',
      velocity_kmh: 400.0,
      status: 'CLIMBING_NOMINAL',
    },
    {
      climber_id: 'climber-maglev-atlas-04',
      name: 'Atlas Orbital Foundry Habitat Hoist 04',
      altitude_km: 18400.0,
      payload_tons: 90.0,
      power_transmission: 'Free-Electron Laser Wireless Beaming',
      velocity_kmh: 440.0,
      status: 'CLIMBING_NOMINAL',
    },
  ]);
}
