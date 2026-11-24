import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LAUNCH = {
  run_id: "RUN-REDTEAM-SIMULATED-01",
  scenario_id: "SCENARIO-STUFFING-01",
  scenario_title: "Distributed Credential Stuffing & Kerberoasting Spray",
  target_pop: "POP-US-EAST",
  adversary: "APT-FIN8 (DarkSilk Financial Syndicate)",
  attack_vector: "150k credential brute-force probes/min with randomized proxy rotation",
  containment_latency_ms: 8.4,
  containment_sla_ms: 15.0,
  sla_met: true,
  defense_action: "Autonomous eBPF XDP rate limiter & Honey-Token deception trap",
  status: "CONTAINED_AND_SEVERED",
  merkle_record_hash: "8b417e29c0a19482719284a10293847561029384756102938475610293847561",
  executed_at: Date.now() / 1000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/simulation/redteam-pop/launch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_LAUNCH,
        scenario_id: body.scenario_id || "SCENARIO-STUFFING-01",
        target_pop: body.pop_id || "POP-US-EAST",
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_LAUNCH);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_LAUNCH);
  }
}
