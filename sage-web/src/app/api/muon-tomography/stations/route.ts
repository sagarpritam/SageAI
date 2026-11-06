import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      station_id: "MUON-TEL-ALPS-GRANITE",
      location_name: "Mont Blanc Deep Shaft",
      latitude: 45.8326,
      longitude: 6.8652,
      altitude_m: 1250.0,
      detector_type: "RPC_MULTILAYER",
      effective_area_m2: 4.5,
      angular_resolution_mrad: 1.2,
      zenith_acceptance_deg: 75.0,
      muon_count_rate_hz: 82.0,
      status: "SCANNING_CONTINUOUS",
    },
    {
      station_id: "MUON-TEL-CHEYENNE-BUNKER",
      location_name: "Cheyenne Mountain Perimeter",
      latitude: 38.7439,
      longitude: -104.8475,
      altitude_m: 1950.0,
      detector_type: "SCINTILLATOR_BAR_HODOSCOPE",
      effective_area_m2: 5.0,
      angular_resolution_mrad: 1.35,
      zenith_acceptance_deg: 75.0,
      muon_count_rate_hz: 94.5,
      status: "SCANNING_CONTINUOUS",
    },
    {
      station_id: "MUON-TEL-ZAGROS-ADIT",
      location_name: "Zagros Fold Subsurface Adit",
      latitude: 32.4279,
      longitude: 51.6876,
      altitude_m: 1680.0,
      detector_type: "RPC_MULTILAYER",
      effective_area_m2: 3.8,
      angular_resolution_mrad: 1.4,
      zenith_acceptance_deg: 75.0,
      muon_count_rate_hz: 76.2,
      status: "SCANNING_CONTINUOUS",
    },
  ]);
}
