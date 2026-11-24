import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/haag-kastler-bus/channels", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Haag-Kastler channels:", err);
  }

  return NextResponse.json([
    {
      channel_id: "HAAG-CAUSAL-DIAMOND-ALPHA",
      channel_name: "Double Cone Causal Diamond Waveguide",
      diamond_volume_m3: 0.0125,
      algebra_type: "TYPE_III_1_FACTOR",
      channel_throughput_pbps: 1550.0,
      split_property_ratio: 1.0,
      status: "MICROCAUSALITY_ENFORCED",
    },
    {
      channel_id: "VON-NEUMANN-ALGEBRA-BETA",
      channel_name: "Local Observable Hyperfinite Factor",
      diamond_volume_m3: 0.025,
      algebra_type: "TYPE_III_1_FACTOR",
      channel_throughput_pbps: 1550.0,
      split_property_ratio: 1.0,
      status: "HAAG_DUALITY_ACTIVE",
    },
    {
      channel_id: "SPLIT-INCLUSION-GAMMA",
      channel_name: "Type I Factor Product State Bridge",
      diamond_volume_m3: 0.0375,
      algebra_type: "TYPE_I_FACTOR_SPLIT",
      channel_throughput_pbps: 1550.0,
      split_property_ratio: 1.0,
      status: "STATISTICAL_INDEPENDENCE_SECURED",
    },
    {
      channel_id: "BISOGNANO-WICHMANN-DELTA",
      channel_name: "Modular Wedge Reeh-Schlieder Channel",
      diamond_volume_m3: 0.05,
      algebra_type: "MODULAR_WEDGE_FACTOR",
      channel_throughput_pbps: 1550.0,
      split_property_ratio: 1.0,
      status: "MODULAR_BOOST_OPTIMAL",
    },
  ]);
}
