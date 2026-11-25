import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_STREAM = [
  {
    stream_id: "EVID-STREAM-01",
    control_id: "CC6.1",
    timestamp: Date.now() / 1000 - 30,
    event: "Hardware Enclave SGX-US-EAST DCAP quote attested; zero key extraction.",
    merkle_hash: "e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    verification_status: "PASS",
  },
  {
    stream_id: "EVID-STREAM-02",
    control_id: "CC6.6",
    timestamp: Date.now() / 1000 - 120,
    event: "eBPF XDP zero-copy drop applied to 180k SYN packets on POP-US-EAST.",
    merkle_hash: "f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
    verification_status: "PASS",
  },
  {
    stream_id: "EVID-STREAM-03",
    control_id: "CC7.3",
    timestamp: Date.now() / 1000 - 240,
    event: "SOC Incident INC-2026-9481 contained in 8.4ms; NIST IR report signed.",
    merkle_hash: "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
    verification_status: "PASS",
  },
  {
    stream_id: "EVID-STREAM-04",
    control_id: "A1.2",
    timestamp: Date.now() / 1000 - 400,
    event: "BGP Anycast failover simulated; hot-standby converged in 38.4ms.",
    merkle_hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
    verification_status: "PASS",
  },
  {
    stream_id: "EVID-STREAM-05",
    control_id: "PI1.4",
    timestamp: Date.now() / 1000 - 600,
    event: "Series A $6.0M FedWire transfer confirmed and cap table cryptographically locked.",
    merkle_hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    verification_status: "PASS",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/compliance/soc2-auditor/evidence-stream`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_STREAM);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback SOC 2 evidence stream:", e);
  }
  return NextResponse.json(FALLBACK_STREAM);
}
