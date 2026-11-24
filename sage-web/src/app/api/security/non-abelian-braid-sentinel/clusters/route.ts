import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/non-abelian-braid-sentinel/clusters", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Non-Abelian Braid Sentinel clusters:", err);
    return NextResponse.json([
      {
        cluster_id: "NAAS-CLUSTER-KITAEV-NANOWIRE",
        heterostructure: "InAs-Al-SUPERCONDUCTOR-HYBRID",
        majorana_zero_modes: 4,
        braid_generator: "SIGMA_1_SIGMA_2_BRAID",
        topological_qubits: 2,
        parity_readout_status: "ZERO_BIAS_CONDUCTANCE_PEAK_LOCKED",
      },
      {
        cluster_id: "NAAS-CLUSTER-FIBONACCI-GOLDEN",
        heterostructure: "BILAYER-FQHE-nu-12-5",
        majorana_zero_modes: 6,
        braid_generator: "UNIVERSAL_GOLDEN_RATIO_GATE",
        topological_qubits: 3,
        parity_readout_status: "NON_ABELIAN_FUSION_CHANNELS_STABLE",
      },
      {
        cluster_id: "NAAS-CLUSTER-MOORE-READ-PFAFFIAN",
        heterostructure: "GaAs-AlGaAs-2DEG-HIGH-MOBILITY",
        majorana_zero_modes: 8,
        braid_generator: "PFAFFIAN_ISOBARIC_PHASE_GATE",
        topological_qubits: 4,
        parity_readout_status: "FRACTIONAL_CHARGE_e_OVER_4_SECURED",
      },
      {
        cluster_id: "NAAS-CLUSTER-READ-REZAYI-PARAFERMION",
        heterostructure: "Z3-PARAFERMION-TOPOLOGICAL-INSULATOR",
        majorana_zero_modes: 6,
        braid_generator: "CLIFFORD_PLUS_T_FAULT_TOLERANT",
        topological_qubits: 3,
        parity_readout_status: "ENTANGLEMENT_WITNESS_CONFIRMED",
      },
    ]);
  }
}
