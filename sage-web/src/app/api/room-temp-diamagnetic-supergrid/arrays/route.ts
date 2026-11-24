import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "DIAMAGNETIC-LK99-ARRAY-01",
      location: "Equatorial Cu-Substituted Lead-Apatite Diamagnetic Superconducting Harvester",
      default_meissner_field_tesla: 14.5,
      diamagnetic_order_rank: 4,
      base_output_gw: 485.0,
      base_efficiency_pct: 98.88,
      status: "DIAMAGNETIC_LEVITATION_COHERENT",
    },
    {
      array_id: "MEISSNER-HVDC-LEVITATION-02",
      location: "Trans-Pacific Macroscopic Meissner-Levitation Zero-Dissipation HVDC Trunk",
      default_meissner_field_tesla: 28.0,
      diamagnetic_order_rank: 6,
      base_output_gw: 730.0,
      base_efficiency_pct: 99.35,
      status: "DIAMAGNETIC_LEVITATION_COHERENT",
    },
    {
      array_id: "ORBITAL-CRYOFREE-STORAGE-03",
      location: "Orbital Cryogenics-Free Lead-Apatite Persistent Supercurrent Ring",
      default_meissner_field_tesla: 45.0,
      diamagnetic_order_rank: 8,
      base_output_gw: 1080.0,
      base_efficiency_pct: 99.72,
      status: "DIAMAGNETIC_LEVITATION_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/room-temp-diamagnetic-supergrid/arrays`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}
