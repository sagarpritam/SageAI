import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/ryu-takayanagi/telemetry", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Ryu-Takayanagi telemetry:", err);
    return NextResponse.json({
      backbone_id: "RT-ENTANGLEMENT-WEDGE-01",
      holographic_bulk_geometry: "ADS5_S5_WARPED_THROAT",
      boundary_dimension: 4,
      ryu_takayanagi_minimal_area_geodesic: 4.2e14,
      optical_bus_throughput_pbps: 3600.0,
      wedge_reconstruction_fidelity_percent: 99.99999,
      status: "RYU_TAKAYANAGI_WEDGE_ACTIVE",
      active_holographic_channels: 4,
    });
  }
}
