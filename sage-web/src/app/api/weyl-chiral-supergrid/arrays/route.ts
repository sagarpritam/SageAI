import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "WEYL-TAAS-ARRAY-01",
      location: "Equatorial Type-I Weyl Semimetal TaAs Fermi-Arc Harvester",
      default_fermi_arc_angstrom: 0.42,
      chiral_charge_order: 4,
      base_output_gw: 348.0,
      base_efficiency_pct: 98.54,
      status: "WEYL_CHIRAL_COHERENT",
    },
    {
      array_id: "CHIRAL-COSI-HVDC-02",
      location: "Trans-Pacific Chiral Multifold CoSi Quantum Anomalous HVDC Trunk",
      default_fermi_arc_angstrom: 0.58,
      chiral_charge_order: 6,
      base_output_gw: 508.0,
      base_efficiency_pct: 99.02,
      status: "WEYL_CHIRAL_COHERENT",
    },
    {
      array_id: "WEYL-ORBITAL-RING-03",
      location: "Orbital THz Chiral Anomaly Photo-Galvanic Rectification Ring",
      default_fermi_arc_angstrom: 0.76,
      chiral_charge_order: 8,
      base_output_gw: 712.0,
      base_efficiency_pct: 99.44,
      status: "WEYL_CHIRAL_COHERENT",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/weyl-chiral-supergrid/arrays`,
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
