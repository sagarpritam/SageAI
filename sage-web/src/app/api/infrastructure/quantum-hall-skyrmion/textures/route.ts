import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/quantum-hall-skyrmion/textures", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Quantum Hall Skyrmion textures:", err);
    return NextResponse.json([
      {
        texture_id: "QHSB-TEXTURE-LATTICE-TRIANGULAR",
        morphology: "TRIANGULAR_SKYRMION_CRYSTAL",
        topological_charge_q: -1,
        skyrmion_radius_nm: 18.5,
        exchange_stiffness_mev: 4.2,
        microwave_resonance_q_factor: 850000,
        status: "TOPOLOGICALLY_STABILIZED",
      },
      {
        texture_id: "QHSB-TEXTURE-NEEL-HEDGEHOG",
        morphology: "NEEL_RADIAL_HEDGEHOG",
        topological_charge_q: 1,
        skyrmion_radius_nm: 22.0,
        exchange_stiffness_mev: 3.9,
        microwave_resonance_q_factor: 790000,
        status: "CHIRAL_BOUNDARY_LOCKED",
      },
      {
        texture_id: "QHSB-TEXTURE-BLOCH-CHIRAL",
        morphology: "BLOCH_VORTEX_HELICAL",
        topological_charge_q: -1,
        skyrmion_radius_nm: 16.2,
        exchange_stiffness_mev: 4.8,
        microwave_resonance_q_factor: 920000,
        status: "DZYALOSHINSKII_MORIYA_COUPLED",
      },
      {
        texture_id: "QHSB-TEXTURE-MERON-ANTIMERON-PAIR",
        morphology: "FRACTIONAL_MERON_ANTIMERON_MOLECULE",
        topological_charge_q: 0,
        skyrmion_radius_nm: 12.8,
        exchange_stiffness_mev: 5.1,
        microwave_resonance_q_factor: 960000,
        status: "NEUTRAL_EXCITON_BOUND_LOCKED",
      },
    ]);
  }
}
