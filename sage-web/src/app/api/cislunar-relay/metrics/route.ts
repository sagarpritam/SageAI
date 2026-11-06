import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_nodes: 4,
    total_transmissions_logged: 18,
    max_distance_km: 448900.0,
    primary_constellation: "Earth-Moon L1/L2 High-Rate Quantum Laser Mesh",
    active_oam_channels: 20,
    status: "OPERATIONAL",
  });
}

