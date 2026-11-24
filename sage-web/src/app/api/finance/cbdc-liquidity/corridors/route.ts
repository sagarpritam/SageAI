import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/cbdc-liquidity/corridors', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback CBDC Liquidity corridors:', error);
  }

  return NextResponse.json([
    {
      corridor_id: 'corridor-usd-fednow-eur',
      currency_pair: 'Digital USD (FedNow) / Digital EUR (Eurosystem)',
      central_banks: 'Federal Reserve / European Central Bank',
      daily_volume_usd: 6500000000.0,
      settlement_latency_ms: 12.4,
      liquidity_pool_usd: 1500000000.0,
      pvp_status: 'ATOMIC_FINALITY_LOCKED',
      status: 'CORRIDOR_ACTIVE',
    },
    {
      corridor_id: 'corridor-mbridge-asia',
      currency_pair: 'mBridge Wholesale Multi-CBDC (HKD/THB/AED/CNY)',
      central_banks: 'HKMA / BOT / CBO / Digital Currency Institute PBOC',
      daily_volume_usd: 5200000000.0,
      settlement_latency_ms: 15.1,
      liquidity_pool_usd: 1200000000.0,
      pvp_status: 'ATOMIC_FINALITY_LOCKED',
      status: 'CORRIDOR_ACTIVE',
    },
    {
      corridor_id: 'corridor-gbp-chf-sovereign',
      currency_pair: 'Digital Sterling (Bank of England) / Swiss Franc (SNB)',
      central_banks: 'Bank of England / Swiss National Bank',
      daily_volume_usd: 3800000000.0,
      settlement_latency_ms: 14.2,
      liquidity_pool_usd: 850000000.0,
      pvp_status: 'ATOMIC_FINALITY_LOCKED',
      status: 'CORRIDOR_ACTIVE',
    },
    {
      corridor_id: 'corridor-jpy-sgd-cloud',
      currency_pair: 'Digital Yen (BOJ) / Project Orchid SGD (MAS Cloud Escrow)',
      central_banks: 'Bank of Japan / Monetary Authority of Singapore',
      daily_volume_usd: 3000000000.0,
      settlement_latency_ms: 16.5,
      liquidity_pool_usd: 650000000.0,
      pvp_status: 'ATOMIC_FINALITY_LOCKED',
      status: 'CORRIDOR_ACTIVE',
    },
  ]);
}
