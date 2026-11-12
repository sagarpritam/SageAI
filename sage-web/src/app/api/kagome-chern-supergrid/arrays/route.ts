import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "KAGOME-CHERN-ARRAY-01",
      location: "Sub-Equatorial Van-Hove Kagome Flat-Band Harvester Array",
      default_chern_gap_mev: 420.0,
      kagome_chern_number: 3,
      base_output_gw: 318.0,
      base_efficiency_pct: 98.42,
      status: "KAGOME_COHERENT",
    },
    {
      array_id: "ANOMALOUS-HALL-HVDC-02",
      location: "Trans-Oceanic Chiral Anomalous-Hall Superconducting Trunk",
      default_chern_gap_mev: 510.0,
      kagome_chern_number: 5,
      base_output_gw: 462.0,
      base_efficiency_pct: 98.89,
      status: "KAGOME_COHERENT",
    },
    {
      array_id: "POLARITON-ORBITAL-RING-03",
      location: "Orbital Exciton-Polariton Condensate Beaming Matrix",
      default_chern_gap_mev: 640.0,
      kagome_chern_number: 7,
      base_output_gw: 644.0,
      base_efficiency_pct: 99.31,
      status: "KAGOME_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kagome-chern-supergrid/arrays`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

