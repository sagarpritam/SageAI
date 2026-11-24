import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/kitaev-honeycomb-bus/channels", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Kitaev Honeycomb channels:", err);
  }

  return NextResponse.json([
    {
      channel_id: "KITAEV-DIRAC-CONE-ALPHA",
      channel_name: "Gapless Majorana Dirac Cone Waveguide",
      exchange_ratio_jx_jy_jz: "1:1:1",
      flux_bias_rad: 0.5236,
      channel_throughput_pbps: 1500.0,
      itinerant_coherence_ratio: 1.0,
      status: "DIRAC_CONE_PINNED",
    },
    {
      channel_id: "Z2-VORTEX-FLUX-BETA",
      channel_name: "Static Z2 Plaquette Flux Sector",
      exchange_ratio_jx_jy_jz: "1:1:1",
      flux_bias_rad: 1.0472,
      channel_throughput_pbps: 1500.0,
      itinerant_coherence_ratio: 1.0,
      status: "Z2_FLUX_ISOLATED",
    },
    {
      channel_id: "MAJORANA-ITINERANT-GAMMA",
      channel_name: "Itinerant Majorana Dispersive Channel",
      exchange_ratio_jx_jy_jz: "1:1:1",
      flux_bias_rad: 1.5708,
      channel_throughput_pbps: 1500.0,
      itinerant_coherence_ratio: 1.0,
      status: "MAJORANA_DISPERSION_OPTIMAL",
    },
    {
      channel_id: "CHIRAL-GAPLESS-EDGE-DELTA",
      channel_name: "Broken Time-Reversal Chiral Edge Mode",
      exchange_ratio_jx_jy_jz: "1:1:1.5",
      flux_bias_rad: 2.0944,
      channel_throughput_pbps: 1500.0,
      itinerant_coherence_ratio: 1.0,
      status: "CHIRAL_EDGE_ACTIVE",
    },
  ]);
}
