import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/fqhe-anyonic-sentinel/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback FQHE Anyonic sectors:", err);
    return NextResponse.json([
      {
        sector_id: "LAUGHLIN-QUASIPARTICLE-CORE",
        braid_sector: "nu = 1/3 Fractional Charge e* = e/3 Braiding Node",
        filling_factor_nu: "1/3",
        braid_phase_radians: 1.0472,
        sidechannel_rejection_db: -149.5,
        status: "FRACTIONAL_CHARGE_CONFINED",
      },
      {
        sector_id: "MOORE-READ-NON-ABELIAN-BETA",
        braid_sector: "nu = 5/2 Majorana Anyon Pfaffian State Wavefunction",
        filling_factor_nu: "5/2",
        braid_phase_radians: 1.5708,
        sidechannel_rejection_db: -148.0,
        status: "NON_ABELIAN_BRAID_LOCKED",
      },
      {
        sector_id: "CHIRAL-EDGE-LUTTINGER-LAYER",
        braid_sector: "Dissipationless 1D Chiral Edge Luttinger Channel",
        filling_factor_nu: "1",
        braid_phase_radians: 3.14159,
        sidechannel_rejection_db: -147.0,
        status: "EDGE_TRANSPORT_ISOLATED",
      },
      {
        sector_id: "COMPOSITE-FERMION-FLUX-TRAP",
        braid_sector: "2 Flux Quanta Attached Cherenkov Chern-Simons Trap",
        filling_factor_nu: "2/5",
        braid_phase_radians: 1.2566,
        sidechannel_rejection_db: -150.0,
        status: "CHERN_SIMONS_FLUX_PINNED",
      },
    ]);
  }
}
