import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/aharonov-bohm-sentinel/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Aharonov-Bohm sectors:", err);
    return NextResponse.json([
      {
        sector_id: "AHARONOV-BOHM-SOLENOID-CORE",
        phase_sector: "Confined Solenoidal Flux Vector Potential B=0, A!=0",
        barrier_thickness_nm: 0.8,
        phase_shift_radians: 3.14159,
        sidechannel_rejection_db: -143.5,
        status: "GAUGE_POTENTIAL_SHIELDED",
      },
      {
        sector_id: "WILSON-LOOP-GEOMETRIC-LAYER",
        phase_sector: "Closed Loop Holonomy Phase Sensor oint A*dr = n*Phi_0",
        barrier_thickness_nm: 1.2,
        phase_shift_radians: 6.28318,
        sidechannel_rejection_db: -142.0,
        status: "WILSON_HOLONOMY_LOCKED",
      },
      {
        sector_id: "FIELD-FREE-FLUX-ABSORBER",
        phase_sector: "Topological Quantum Flux Boundary Trap",
        barrier_thickness_nm: 1.5,
        phase_shift_radians: 1.57079,
        sidechannel_rejection_db: -141.0,
        status: "FIELD_FREE_LEAKAGE_NEUTRALIZED",
      },
      {
        sector_id: "NON-LOCAL-PHASE-INTERFEROMETER",
        phase_sector: "Two-Path Electron Interference Wavefront Clamp",
        barrier_thickness_nm: 2.0,
        phase_shift_radians: 4.71238,
        sidechannel_rejection_db: -144.0,
        status: "INTERFERENCE_CONTRAST_MAXIMAL",
      },
    ]);
  }
}
