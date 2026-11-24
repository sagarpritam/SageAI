import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-helium3-depository/vaults', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Helium-3 Depository vaults:', error);
  }

  return NextResponse.json([
    {
      vault_id: 'he3-vault-shackleton-01',
      name: 'Shackleton Lunar South Pole Depository 01',
      location: 'Moon South Pole Base',
      allocated_kg: 850.0,
      cryo_temp_k: 2.1,
      canister_serial_count: 85,
      audit_status: 'CRYOGENIC_MASS_SPECTROMETRY_VERIFIED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'he3-vault-mare-tranquillitatis-02',
      name: 'Mare Tranquillitatis Regolith Extraction Vault 02',
      location: 'Lunar Nearside Equator',
      allocated_kg: 720.0,
      cryo_temp_k: 2.1,
      canister_serial_count: 72,
      audit_status: 'CRYOGENIC_MASS_SPECTROMETRY_VERIFIED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'he3-vault-kennedy-cryo-03',
      name: 'Cape Canaveral Terrestrial Receiving Vault 03',
      location: 'Florida, USA',
      allocated_kg: 510.0,
      cryo_temp_k: 2.1,
      canister_serial_count: 51,
      audit_status: 'IAEA_SAFEGUARDS_CROSS_ATTESTED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
    {
      vault_id: 'he3-vault-kourou-esa-04',
      name: 'Guiana Space Centre Deep Cryo Depository 04',
      location: 'Kourou, French Guiana',
      allocated_kg: 420.0,
      cryo_temp_k: 2.1,
      canister_serial_count: 42,
      audit_status: 'ESA_EURATOM_VERIFIED',
      status: 'PHYSICAL_CUSTODY_LOCKED',
    },
  ]);
}
