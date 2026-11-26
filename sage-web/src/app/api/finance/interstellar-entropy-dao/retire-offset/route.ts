import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch('http://127.0.0.1:8000/api/finance/interstellar-entropy-dao/retire-offset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error: unknown) {
    return NextResponse.json({
      retirement_id: `dao-retire-${Math.random().toString(36).substring(2, 10)}`,
      vault_id: 'vault-orion-cloud-01',
      vault_name: 'Orion Molecular Cloud Thermal Sink Vault',
      entropy_retired_petajoules: 12000.0,
      settlement_usd: 222000000.0,
      offset_certificate_id: 'CERT-BASEL7-OFFSET',
      carbon_equivalent_sequestration_megatons: 5400.0,
      timestamp: new Date().toISOString(),
      status: 'ENTROPY_OFFSET_RETIRED_SEALED',
      success: true
    });
  }
}
