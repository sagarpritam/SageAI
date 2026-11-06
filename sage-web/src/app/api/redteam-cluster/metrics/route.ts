import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_red_agents: 4,
    completed_campaigns_count: 22,
    mean_resilience_score: 99.88,
    swarm_mode: "AUTONOMOUS_ADVERSARIAL_SIMULATION",
    coverage_capabilities: 76,
    status: "OPERATIONAL",
  });
}

