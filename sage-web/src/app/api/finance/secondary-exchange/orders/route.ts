import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/secondary-exchange/orders', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback ATS secondary exchange orders:', error);
  }

  // Fallback high-fidelity orders
  return NextResponse.json([
    {
      order_id: 'ord-ats-701',
      side: 'BUY',
      participant_type: 'Sovereign Wealth Fund',
      shares: 160000,
      price_limit_usd: 31.25,
      notional_usd: 5000000.0,
      order_type: 'MIDPOINT_CROSS_ONLY',
      status: 'SETTLED',
      timestamp: new Date().toISOString(),
    },
    {
      order_id: 'ord-ats-702',
      side: 'SELL',
      participant_type: 'Employee Equity Pool Tender',
      shares: 80000,
      price_limit_usd: 31.25,
      notional_usd: 2500000.0,
      order_type: 'MIDPOINT_CROSS_ONLY',
      status: 'SETTLED',
      timestamp: new Date().toISOString(),
    },
    {
      order_id: 'ord-ats-703',
      side: 'BUY',
      participant_type: 'Tier-1 Growth Equity Syndicate',
      shares: 128000,
      price_limit_usd: 31.25,
      notional_usd: 4000000.0,
      order_type: 'MIDPOINT_CROSS_ONLY',
      status: 'PENDING_CROSS',
      timestamp: new Date().toISOString(),
    },
    {
      order_id: 'ord-ats-704',
      side: 'SELL',
      participant_type: 'Accredited Angel Syndicate',
      shares: 57600,
      price_limit_usd: 31.25,
      notional_usd: 1800000.0,
      order_type: 'MIDPOINT_CROSS_ONLY',
      status: 'PENDING_CROSS',
      timestamp: new Date().toISOString(),
    },
  ]);
}
