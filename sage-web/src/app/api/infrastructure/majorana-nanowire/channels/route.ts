import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/majorana-nanowire/channels", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Majorana Nanowire channels:", err);
    return NextResponse.json([
      {
        channel_id: "INAS-AL-NANOWIRE-ALPHA",
        nanowire_geometry: "Single-Wire End-Mode Pair",
        wire_length_microns: 2.5,
        majorana_coherence_time_us: 150.0,
        optical_channel_throughput_pbps: 700.0,
        status: "TOPOLOGICAL_PHASE_STABILIZED",
      },
      {
        channel_id: "T-JUNCTION-SHUTTLE-BETA",
        nanowire_geometry: "Tri-Junction Majorana Shuttle Network",
        wire_length_microns: 3.8,
        majorana_coherence_time_us: 180.0,
        optical_channel_throughput_pbps: 700.0,
        status: "SHUTTLE_BRAID_COHERENT",
      },
      {
        channel_id: "PROXIMITY-INDUCED-GAMMA",
        nanowire_geometry: "Superconductor-Ferromagnet-Semiconductor Hybrid",
        wire_length_microns: 4.2,
        majorana_coherence_time_us: 165.0,
        optical_channel_throughput_pbps: 700.0,
        status: "PROXIMITY_PAIRING_LOCKED",
      },
      {
        channel_id: "ZEEMAN-TOPOLOGICAL-DELTA",
        nanowire_geometry: "In-Plane Spin-Split Nanowire Array",
        wire_length_microns: 3.0,
        majorana_coherence_time_us: 195.0,
        optical_channel_throughput_pbps: 700.0,
        status: "ZEEMAN_TUNED_OPTIMAL",
      },
    ]);
  }
}
