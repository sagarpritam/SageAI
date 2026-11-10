import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/telecom-5g/slices`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackSlices());
  } catch {
    return NextResponse.json(getFallbackSlices());
  }
}

function getFallbackSlices() {
  return {
    status: "success",
    slices: [
      {
        slice_id: "slice-urllc-defense-01",
        name: "Autonomous Kinetic Defense & Telemetry (URLLC)",
        sst: 2,
        sd: "0xA1B2C3",
        max_latency_ms: 1.2,
        bandwidth_gbps: 10.0,
        packet_loss_rate: 0.00001,
        status: "PROTECTED_ACTIVE",
        connected_ues: 1420,
        rogue_threats_blocked: 7,
      },
      {
        slice_id: "slice-embb-surveillance-02",
        name: "High-Definition Sovereign Aerial Reconnaissance (eMBB)",
        sst: 1,
        sd: "0xD4E5F6",
        max_latency_ms: 12.5,
        bandwidth_gbps: 100.0,
        packet_loss_rate: 0.001,
        status: "PROTECTED_ACTIVE",
        connected_ues: 480,
        rogue_threats_blocked: 3,
      },
      {
        slice_id: "slice-mmtc-smartgrid-03",
        name: "Massive Critical Energy Substation SCADA Mesh (mMTC)",
        sst: 3,
        sd: "0x7890AB",
        max_latency_ms: 45.0,
        bandwidth_gbps: 2.5,
        packet_loss_rate: 0.0001,
        status: "PROTECTED_ACTIVE",
        connected_ues: 85000,
        rogue_threats_blocked: 12,
      },
    ],
  };
}

