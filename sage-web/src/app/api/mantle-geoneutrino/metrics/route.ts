import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_geoneutrino_observatories: 3,
    total_scintillator_mass_ktons: 21.3,
    completed_inversions_count: 12,
    deepest_layer_imaged_km: 2890.0,
    target_physics: "U238_TH232_INVERSE_BETA_DECAY",
    status: "OPERATIONAL",
  });
}
