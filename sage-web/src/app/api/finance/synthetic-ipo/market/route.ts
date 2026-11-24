import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/finance/synthetic-ipo/market', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Using fallback Synthetic IPO market summary:', error);
  }

  // Fallback high-fidelity market summary
  return NextResponse.json({
    venue_id: 'venue-synthetic-ipo-dutch-01',
    name: 'Sage Direct Listing & Dutch Auction Settlement Facility',
    status: 'AUCTION_PRICED_OVERSUBSCRIBED',
    ticker_symbol: 'SAGE',
    exchange_target: 'NASDAQ Global Select Market',
    implied_market_cap_usd: 1200000000.0,
    shares_offered_count: 4347826,
    clearing_price_usd: 34.50,
    total_bids_submitted_count: 86,
    total_demand_shares: 10869565,
    oversubscription_ratio: 2.50,
    greenshoe_overallotment_shares: 652174,
    greenshoe_stabilization_active: true,
    gross_proceeds_usd: 150000000.0,
    last_clearing_timestamp: new Date().toISOString(),
  });
}
