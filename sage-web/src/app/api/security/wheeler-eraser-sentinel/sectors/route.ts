import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/wheeler-eraser-sentinel/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Wheeler Eraser sectors:", err);
    return NextResponse.json([
      {
        sector_id: "WHEELER-DELAYED-CHOICE-CORE",
        eraser_sector: "Retrocausal Which-Way Measurement Eraser Prism",
        optical_delay_nanoseconds: 0.5,
        erasure_fidelity_percent: 99.99999,
        sidechannel_rejection_db: -146.5,
        status: "WHICH_WAY_ERASED_OPTIMAL",
      },
      {
        sector_id: "ENTANGLED-IDLER-ROUTER",
        eraser_sector: "BBO Crystal SPDC Idler Photon Routing Substrate",
        optical_delay_nanoseconds: 0.8,
        erasure_fidelity_percent: 99.99998,
        sidechannel_rejection_db: -145.0,
        status: "IDLER_PATH_DECOUPLED",
      },
      {
        sector_id: "RETROCAUSAL-INTERFERENCE-SHIELD",
        eraser_sector: "Quantum Eraser Coincidence Counter Filter Mask",
        optical_delay_nanoseconds: 1.2,
        erasure_fidelity_percent: 99.99999,
        sidechannel_rejection_db: -144.5,
        status: "COINCIDENCE_INTERFERENCE_RESTORED",
      },
      {
        sector_id: "CAUSAL-DECOUPLING-BARRIER",
        eraser_sector: "Non-Signaling Causal Isolation Envelope",
        optical_delay_nanoseconds: 1.5,
        erasure_fidelity_percent: 99.99999,
        sidechannel_rejection_db: -147.0,
        status: "CAUSAL_SEPARATION_ENFORCED",
      },
    ]);
  }
}
