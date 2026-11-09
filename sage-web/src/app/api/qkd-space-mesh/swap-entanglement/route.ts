import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = body.origin_node_id || "QKD-EARTH-CANARY-01";
    const relay = body.relay_node_id || "QKD-RELAY-LAGRANGE-L1-03";
    const dest = body.destination_node_id || "QKD-PROBE-MARS-ORBIT-04";

    return NextResponse.json({
      swap_id: `QKD-SWAP-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      origin_node_id: origin,
      relay_node_id: relay,
      destination_node_id: dest,
      entanglement_fidelity: 0.9785,
      end_to_end_distance_km: 225000000.0,
      secure_key_rate_kbps: 3.02,
      shapiro_delay_compensation_ms: 3.002,
      zero_trust_signature_verified: true,
      status: "INTERPLANETARY_ENTANGLEMENT_SWAP_ESTABLISHED",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

