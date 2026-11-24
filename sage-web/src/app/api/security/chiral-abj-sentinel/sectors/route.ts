import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/security/chiral-abj-sentinel/sectors");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Chiral ABJ sectors:", err);
    return NextResponse.json([
      {
        sector_id: "ABJ-SPECTRAL-FLOW-ALPHA",
        anomaly_sector: "Adler-Bell-Jackiw Axial Current Spectral Flow Node",
        e_dot_b_v2_m2: 4.85e12,
        axial_charge_imbalance: 0.0,
        sidechannel_rejection_db: -152.5,
        status: "SPECTRAL_FLOW_CONFINED",
      },
      {
        sector_id: "WEYL-VALLEY-TRANSPORT-BETA",
        anomaly_sector: "Dissipationless Chiral Valley Hall Transport Channel",
        e_dot_b_v2_m2: 4.50e12,
        axial_charge_imbalance: 0.0,
        sidechannel_rejection_db: -151.8,
        status: "VALLEY_TRANSPORT_LOCKED",
      },
      {
        sector_id: "AXIAL-CHARGE-CONSERVATION-GAMMA",
        anomaly_sector: "Axial Anomaly Pump Charge Cancellation Barrier",
        e_dot_b_v2_m2: 5.10e12,
        axial_charge_imbalance: 0.0,
        sidechannel_rejection_db: -153.0,
        status: "AXIAL_PUMP_STABILIZED",
      },
      {
        sector_id: "GAUGE-INTRUSION-CHIRAL-DELTA",
        anomaly_sector: "Non-Abelian Gauge Instanton Topological Charge Filter",
        e_dot_b_v2_m2: 4.70e12,
        axial_charge_imbalance: 0.0,
        sidechannel_rejection_db: -152.0,
        status: "GAUGE_INSTANTON_QUENCHED",
      },
    ]);
  }
}
