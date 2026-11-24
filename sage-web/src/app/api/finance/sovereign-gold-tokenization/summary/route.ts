import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/sovereign-gold-tokenization/summary', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Sovereign Gold Tokenization summary:', error);
  }

  return NextResponse.json({
    vault_system_id: 'sovereign-bullion-dvp-engine-01',
    status: 'LBMA_ALLOCATED_BULLION_ACTIVE',
    total_allocated_gold_metric_tons: 1450.0,
    custody_vault_locations: 'London, Zurich, Singapore, New York',
    gold_backing_notional_usd: 116000000000.0,
    tokenized_bullion_supply_oz: 46618500.0,
    audit_verification_standard: 'LBMA_GOOD_DELIVERY_ISO_20022_ATTESTED',
    instant_dvp_settlement_sla_sec: 1.8,
    active_participating_central_banks: 32,
    last_dvp_settlement_timestamp: new Date().toISOString(),
  });
}
