import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/wald-entropy-sentinel/sectors", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Wald Entropy sectors:", err);
    return NextResponse.json([
      {
        sector_id: "WALD-NOETHER-2FORM-CORE",
        differential_form_sector: "Bifurcation Surface Integral Q[xi]",
        gauss_bonnet_coupling_alpha: 0.08,
        noether_flux_density: 1.45e18,
        sidechannel_rejection_db: -136.5,
        status: "NOETHER_SURFACE_INTEGRAL_CLOSED",
      },
      {
        sector_id: "GAUSS-BONNET-EULER-SECTOR",
        differential_form_sector: "Lovelock Quadratic Curvature Correction",
        gauss_bonnet_coupling_alpha: 0.08,
        noether_flux_density: 1.25e18,
        sidechannel_rejection_db: -135.0,
        status: "GAUSS_BONNET_TOPOLOGY_VERIFIED",
      },
      {
        sector_id: "KILLING-VECTOR-SYMMETRY",
        differential_form_sector: "Horizon Bifurcation Killing Field xi^a",
        gauss_bonnet_coupling_alpha: 0.08,
        noether_flux_density: 1.15e18,
        sidechannel_rejection_db: -134.0,
        status: "KILLING_SYMMETRY_PRESERVED",
      },
      {
        sector_id: "COVARIANT-PHASE-SPACE",
        differential_form_sector: "Symplectic Potential theta and Current J",
        gauss_bonnet_coupling_alpha: 0.08,
        noether_flux_density: 1.55e18,
        sidechannel_rejection_db: -137.0,
        status: "SYMPLECTIC_FLUX_DAMPED",
      },
    ]);
  }
}
