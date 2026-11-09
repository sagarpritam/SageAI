import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "RYU-TAK-NODE-GENEVA-01",
      facility_name: "Geneva Bulk Holographic Boundary Siphon Primary",
      boundary_cft_dimension_d: 4,
      bulk_ads_radius_meters: 1.48e-15,
      boundary_subsystem_length_m: 120.0,
      bulk_minimal_surface_area_m2: 2.45e-28,
      entanglement_entropy_nats: 1.142,
      central_charge_c: 120.0,
      status: "HOLOGRAPHIC_DUALITY_LOCKED",
    },
    {
      node_id: "RYU-TAK-NODE-TSUKUBA-02",
      facility_name: "Tsukuba Codimension-2 Minimal Geodesic Transceiver",
      boundary_cft_dimension_d: 4,
      bulk_ads_radius_meters: 1.35e-15,
      boundary_subsystem_length_m: 210.0,
      bulk_minimal_surface_area_m2: 3.95e-28,
      entanglement_entropy_nats: 1.520,
      central_charge_c: 98.5,
      status: "HOLOGRAPHIC_DUALITY_LOCKED",
    },
    {
      node_id: "RYU-TAK-NODE-ORBITAL-L1-03",
      facility_name: "Lagrange L1 Deep-Space Holographic Horizon Siphon",
      boundary_cft_dimension_d: 4,
      bulk_ads_radius_meters: 2.1e-15,
      boundary_subsystem_length_m: 450.0,
      bulk_minimal_surface_area_m2: 6.84e-28,
      entanglement_entropy_nats: 2.410,
      central_charge_c: 185.0,
      status: "HOLOGRAPHIC_DUALITY_LOCKED",
    },
  ]);
}

