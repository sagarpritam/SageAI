import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/hfgw-cryptographic-perimeter/interferometers', {
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
        node_id: 'hfgw-node-geneva-cern-01',
        name: 'Geneva Underground High-Q Microwave Cavity Beacon',
        location: 'Geneva, Switzerland (CERN Deep Vault)',
        cavity_length_meters: 120.0,
        resonance_frequency_ghz: 2.45,
        q_factor: 4.8e10,
        strain_resolution: '1.1e-31 /sqrt(Hz)',
        status: 'RESONANT_CRYPTO_ACTIVE'
      },
      {
        node_id: 'hfgw-node-kamioka-02',
        name: 'Kamioka Subterranean Cryogenic Gravitational Transceiver',
        location: 'Hida, Gifu Prefecture, Japan',
        cavity_length_meters: 95.0,
        resonance_frequency_ghz: 2.80,
        q_factor: 5.2e10,
        strain_resolution: '0.9e-31 /sqrt(Hz)',
        status: 'RESONANT_CRYPTO_ACTIVE'
      },
      {
        node_id: 'hfgw-node-sanford-03',
        name: 'Sanford Underground Spacetime Strain Array',
        location: 'Lead, South Dakota, USA (4850L Cavern)',
        cavity_length_meters: 150.0,
        resonance_frequency_ghz: 2.10,
        q_factor: 6.1e10,
        strain_resolution: '1.3e-31 /sqrt(Hz)',
        status: 'RESONANT_CRYPTO_ACTIVE'
      },
      {
        node_id: 'hfgw-node-sutherland-04',
        name: 'Karoo SAAO Cryogenic Graviton Resonator',
        location: 'Sutherland Plateau, Northern Cape, South Africa',
        cavity_length_meters: 80.0,
        resonance_frequency_ghz: 3.10,
        q_factor: 4.5e10,
        strain_resolution: '1.4e-31 /sqrt(Hz)',
        status: 'RESONANT_CRYPTO_ACTIVE'
      }
    ]);
  }
}
