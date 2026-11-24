import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/majorana-parity-sentinel/sectors");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Majorana Parity sectors:", err);
    return NextResponse.json([
      {
        sector_id: "KITAEV-CHAIN-ZERO-MODE-ALPHA",
        parity_sector: "Unpaired Majorana Boundary State gamma_1 Isolated End Mode",
        fermion_parity: "P = +1 (Even Ground State)",
        topological_gap_mev: 2.45,
        sidechannel_rejection_db: -150.5,
        status: "ZERO_MODE_ISOLATED",
      },
      {
        sector_id: "FERMION-PARITY-CONSERVATION-BETA",
        parity_sector: "Non-Local Parity Conservation Measurement Barrier",
        fermion_parity: "P = +1 (Even Ground State)",
        topological_gap_mev: 2.30,
        sidechannel_rejection_db: -149.8,
        status: "PARITY_CONSERVED",
      },
      {
        sector_id: "BRAIDED-T-JUNCTION-GAMMA",
        parity_sector: "Majorana Wire T-Junction Exchange Braiding Gate",
        fermion_parity: "P = -1 (Odd Parity Excited State)",
        topological_gap_mev: 2.60,
        sidechannel_rejection_db: -151.2,
        status: "TRIJUNCTION_BRAIDED",
      },
      {
        sector_id: "QUASIPARTICLE-POISONING-FILTER-DELTA",
        parity_sector: "Sub-Gap Andreev Bound State Quasiparticle Poisoning Shield",
        fermion_parity: "P = +1 (Even Ground State)",
        topological_gap_mev: 2.50,
        sidechannel_rejection_db: -152.0,
        status: "POISONING_QUENCHED",
      },
    ]);
  }
}
