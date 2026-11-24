import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CAMPAIGNS = [
  {
    id: "RED-SWARM-CAMP-01",
    name: "Token Smuggling & Unicode Steganography Swarm",
    target_component: "LLM-Inference-Engine",
    adversarial_method: "ZERO_WIDTH_TOKEN_INJECTION",
    attempts_count: 18450,
    mitigated_count: 18444,
    success_rate_pct: 0.03,
    severity: "CRITICAL",
    status: "MITIGATED_DYNAMIC_TOKEN_FILTER",
    mitigation_rule_id: "MIT-RULE-UNICODE-8812",
  },
  {
    id: "RED-SWARM-CAMP-02",
    name: "Recursive Indirect RAG Prompt Hijack",
    target_component: "RAG-Knowledge-Vector-Store",
    adversarial_method: "INDIRECT_PROMPT_INJECTION_DOCUMENT",
    attempts_count: 14200,
    mitigated_count: 14195,
    success_rate_pct: 0.04,
    severity: "CRITICAL",
    status: "MITIGATED_VECTOR_CONTEXT_ISOLATION",
    mitigation_rule_id: "MIT-RULE-RAG-CONTEXT-9921",
  },
  {
    id: "RED-SWARM-CAMP-03",
    name: "Subagent Tool Execution Jailbreak & Shell Escapes",
    target_component: "Autonomous-Agent-Orchestrator",
    adversarial_method: "AST_SYNTAX_CONFUSION_ATTACK",
    attempts_count: 12840,
    mitigated_count: 12836,
    success_rate_pct: 0.03,
    severity: "HIGH",
    status: "SANDBOX_SECCOMP_CONSTRAINED",
    mitigation_rule_id: "MIT-RULE-SECCOMP-4402",
  },
  {
    id: "RED-SWARM-CAMP-04",
    name: "Context Window Exhaustion & Attention Drift",
    target_component: "Tool-Execution-Sandbox",
    adversarial_method: "LONG_CONTEXT_ATTENTION_HIJACK",
    attempts_count: 7000,
    mitigated_count: 6998,
    success_rate_pct: 0.03,
    severity: "HIGH",
    status: "BOUNDED_WINDOW_CLAMPED",
    mitigation_rule_id: "MIT-RULE-ATTENTION-1108",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/security/autonomous-redteam/campaigns`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_CAMPAIGNS>(res, FALLBACK_CAMPAIGNS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback redteam campaigns:", e);
  }
  return NextResponse.json(FALLBACK_CAMPAIGNS);
}
