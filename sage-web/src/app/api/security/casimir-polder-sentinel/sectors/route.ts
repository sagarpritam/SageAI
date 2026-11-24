import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/casimir-polder-sentinel/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Casimir-Polder sectors:", err);
    return NextResponse.json([
      {
        sector_id: "CASIMIR-POLDER-POTENTIAL-CORE",
        dispersion_sector: "Atom-Surface Non-Retarded Potential U(r) ~ -C3/r3",
        surface_separation_nm: 1.2,
        dispersion_force_pico_n: 48.5,
        sidechannel_rejection_db: -139.5,
        status: "DISPERSION_POTENTIAL_PINNED",
      },
      {
        sector_id: "LIFSHITZ-DIELECTRIC-LAYER",
        dispersion_sector: "Lifshitz General Retarded Dielectric Dispersion Model",
        surface_separation_nm: 2.5,
        dispersion_force_pico_n: 32.0,
        sidechannel_rejection_db: -138.0,
        status: "DIELECTRIC_PERMITTIVITY_BALANCED",
      },
      {
        sector_id: "EVANESCENT-FIELD-ABSORBER",
        dispersion_sector: "Evanescent Vacuum Polariton Dampener",
        surface_separation_nm: 1.8,
        dispersion_force_pico_n: 41.2,
        sidechannel_rejection_db: -137.0,
        status: "EVANESCENT_MODES_QUENCHED",
      },
      {
        sector_id: "NANO-GAP-QUANTUM-LEVITATION",
        dispersion_sector: "Repulsive Casimir-Polder Metamaterial Barrier",
        surface_separation_nm: 3.0,
        dispersion_force_pico_n: -18.5,
        sidechannel_rejection_db: -140.0,
        status: "REPULSIVE_LEVITATION_ACTIVE",
      },
    ]);
  }
}
