import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      sentinel_id: "TACHYON-SENTINEL-NORTH-POLE-01",
      location_name: "Svalbard Hyperbolic Cryo-Array",
      latitude: 78.2232,
      longitude: 15.6267,
      altitude_m: 450.0,
      metamaterial_cavity_type: "HYPERBOLIC_GRAPHENE_POLARITON",
      negative_refractive_index: -1.92,
      coincidence_sampling_rate_thz: 25.0,
      pre_causal_lookahead_limit_us: 450.0,
      status: "PRE_CAUSAL_MONITORING",
    },
    {
      sentinel_id: "TACHYON-SENTINEL-SOUTH-PACIFIC-02",
      location_name: "Point Nemo Deep Oceanic Mooring",
      latitude: -48.8767,
      longitude: -123.3933,
      altitude_m: -3500.0,
      metamaterial_cavity_type: "HYPERBOLIC_GRAPHENE_POLARITON",
      negative_refractive_index: -1.85,
      coincidence_sampling_rate_thz: 25.0,
      pre_causal_lookahead_limit_us: 450.0,
      status: "PRE_CAUSAL_MONITORING",
    },
    {
      sentinel_id: "TACHYON-SENTINEL-ORBITAL-HELIOS-03",
      location_name: "Lagrange L2 Deep Space Metamaterial Pod",
      latitude: 0.0,
      longitude: 0.0,
      altitude_m: 448900000.0,
      metamaterial_cavity_type: "HYPERBOLIC_GRAPHENE_POLARITON",
      negative_refractive_index: -2.15,
      coincidence_sampling_rate_thz: 25.0,
      pre_causal_lookahead_limit_us: 450.0,
      status: "PRE_CAUSAL_MONITORING",
    },
  ]);
}
