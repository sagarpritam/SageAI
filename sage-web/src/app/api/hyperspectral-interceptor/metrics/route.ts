import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_hyperspectral_satellites: 4,
    total_spectral_bands: 288,
    total_scans_completed: 38,
    total_interceptor_engagements: 12,
    mean_cross_cue_latency_ms: 16.2,
    mean_confidence_score_pct: 98.8,
    constellation_status: "FULL_PLANETARY_COVERAGE_LOCKED",
  });
}
